/*
 * Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the terms of the LICENSE file distributed with this project.
 */

import classNames from "classnames";
import * as React from "react";

import { Classes, Intent } from "../../common";
import { intentClass } from "../../common/classes";
import * as Utils from "../../common/utils";
import { CoreSlider, formatPercentage, ICoreSliderProps } from "./coreSlider";
import { Handle } from "./handle";

export interface ISliderValues {
    [key: string]: number;
}

export const SliderHandleType = {
    FULL: "full" as "full",
    START: "start" as "start",
    // tslint:disable-next-line:object-literal-sort-keys
    END: "end" as "end",
};

export type SliderHandleType = typeof SliderHandleType[keyof typeof SliderHandleType];

export interface ISliderHandleProps {
    trackIntentAfter?: Intent;
    trackIntentBefore?: Intent;
    type?: SliderHandleType;
}

interface ISliderHandleValueProps extends ISliderHandleProps {
    value: number;
}

interface IKeyedSliderHandleValueProps<V extends ISliderValues> extends ISliderHandleValueProps {
    key: keyof V;
}

export interface IMultiRangeSliderProps<V extends ISliderValues> extends ICoreSliderProps {
    values?: V;
    defaultTrackIntent?: Intent;
    getHandleProps?(key: keyof V): ISliderHandleProps;
    onChange?(values: V): void;
    onRelease?(values: V): void;
}

export class MultiRangeSlider<V extends ISliderValues> extends CoreSlider<IMultiRangeSliderProps<V>> {
    public static defaultProps: IMultiRangeSliderProps<any> = {
        ...CoreSlider.defaultProps,
        defaultTrackIntent: Intent.NONE,
    };

    public static displayName = "Blueprint2.MultiRangeSlider";

    public static ofType<V extends ISliderValues>() {
        return MultiRangeSlider as new (props: IMultiRangeSliderProps<V>) => MultiRangeSlider<V>;
    }

    public className = classNames(Classes.SLIDER, Classes.MULTI_RANGE_SLIDER);
    private handles: Handle[] = [];

    public componentWillReceiveProps(nextProps: IMultiRangeSliderProps<V>) {
        super.componentWillReceiveProps(nextProps);
        if (getHandles(nextProps).length !== this.getHandles().length) {
            this.handles = [];
        }
    }

    protected renderFill() {
        const minHandle: ISliderHandleValueProps = { value: this.props.min };
        const maxHandle: ISliderHandleValueProps = { value: this.props.max };
        const expandedHandles = [minHandle, ...this.getSortedHandles(), maxHandle];

        const tracks: Array<JSX.Element | null> = [];

        for (let index = 0; index < expandedHandles.length - 1; index++) {
            const left = expandedHandles[index];
            const right = expandedHandles[index + 1];
            const fillIntentPriorities = [
                left.trackIntentAfter,
                right.trackIntentBefore,
                this.props.defaultTrackIntent,
            ];
            const fillIntent = fillIntentPriorities.filter(intent => intent != null)[0];
            tracks.push(this.renderTrackFill(index, left, right, fillIntent));
        }

        return <div className={Classes.SLIDER_TRACK}>{tracks}</div>;
    }

    protected renderHandles() {
        const { disabled, max, min, stepSize, vertical } = this.props;
        return this.getSortedHandles().map(({ value, type }, index) => (
            <Handle
                className={classNames({
                    [Classes.START]: type === SliderHandleType.START,
                    [Classes.END]: type === SliderHandleType.END,
                })}
                disabled={disabled}
                key={`${index}-${this.getHandles().length}`}
                label={this.formatLabel(value)}
                max={max}
                min={min}
                onChange={this.getHandlerForIndex(index, this.handleChange)}
                onRelease={this.getHandlerForIndex(index, this.handleRelease)}
                ref={this.addHandleRef}
                stepSize={stepSize}
                tickSize={this.state.tickSize}
                tickSizeRatio={this.state.tickSizeRatio}
                value={value}
                vertical={vertical}
            />
        ));
    }

    protected handleTrackClick(event: React.MouseEvent<HTMLElement>) {
        const foundHandle = this.nearestHandleForValue(this.handles, handle => handle.mouseEventClientOffset(event));
        if (foundHandle) {
            foundHandle.beginHandleMovement(event);
        }
    }

    protected handleTrackTouch(event: React.TouchEvent<HTMLElement>) {
        const foundHandle = this.nearestHandleForValue(this.handles, handle => handle.touchEventClientOffset(event));
        if (foundHandle) {
            foundHandle.beginHandleTouchMovement(event);
        }
    }

    private renderTrackFill(
        index: number,
        start: ISliderHandleValueProps,
        end: ISliderHandleValueProps,
        intent: Intent,
    ) {
        const { tickSizeRatio } = this.state;
        const startValue = start.value;
        const endValue = end.value;

        if (startValue === endValue) {
            return undefined;
        }

        let startOffsetRatio = this.getOffsetRatio(startValue, tickSizeRatio);
        let endOffsetRatio = this.getOffsetRatio(endValue, tickSizeRatio);

        if (startOffsetRatio > endOffsetRatio) {
            const temp = endOffsetRatio;
            endOffsetRatio = startOffsetRatio;
            startOffsetRatio = temp;
        }

        const startOffset = formatPercentage(startOffsetRatio);
        const endOffset = formatPercentage(1 - endOffsetRatio);

        const style: React.CSSProperties = this.props.vertical
            ? { bottom: startOffset, top: endOffset, left: 0 }
            : { left: startOffset, right: endOffset, top: 0 };

        const classes = classNames(Classes.SLIDER_PROGRESS, intentClass(intent), {
            [Classes.START]: start.type === SliderHandleType.START,
            [Classes.END]: end.type === SliderHandleType.END,
            [`${Classes.SLIDER_PROGRESS}-empty`]: intent === Intent.NONE,
        });

        return <div key={`track-${index}`} className={classes} style={style} />;
    }

    private getOffsetRatio(value: number, tickSizeRatio: number) {
        return Utils.clamp((value - this.props.min) * tickSizeRatio, 0, 1);
    }

    private nearestHandleForValue(handles: Handle[], getOffset: (handle: Handle) => number): Handle | undefined {
        return argMin(handles, handle => {
            const offset = getOffset(handle);
            const offsetValue = handle.clientToValue(offset);
            const handleValue = handle.props.value!;
            return Math.abs(offsetValue - handleValue);
        });
    }

    private addHandleRef = (ref: Handle) => {
        if (ref != null) {
            this.handles.push(ref);
        }
    };

    private getHandlerForIndex = (index: number, callback?: (values: number[]) => void) => {
        return (newValue: number) => {
            if (Utils.isFunction(callback)) {
                const values = this.getSortedHandles().map(handle => handle.value);
                const start = values.slice(0, index);
                const end = values.slice(index + 1);
                const newValues = [...start, newValue, ...end];
                newValues.sort();
                callback(newValues);
            }
        };
    };

    private handleChange = (values: number[]) => {
        const oldValues = this.getSortedHandles().map(handle => handle.value);
        const newValues = values.slice().sort((left, right) => left - right);
        if (!Utils.arraysEqual(newValues, oldValues) && Utils.isFunction(this.props.onChange)) {
            this.props.onChange(this.computeSliderValues(newValues));
        }
    };

    private handleRelease = (values: number[]) => {
        if (Utils.isFunction(this.props.onRelease)) {
            const newValues = values.slice().sort((left, right) => left - right);
            this.props.onRelease(this.computeSliderValues(newValues));
        }
    };

    private computeSliderValues(sortedValues: number[]): V {
        const values: Partial<V> = {};
        const keys: Array<keyof V> = Object.keys(this.props.values);
        for (let index = 0; index < keys.length; index++) {
            const key = keys[index];
            const value = sortedValues[index];
            values[key] = value;
        }
        return values as V;
    }

    private getSortedHandles(): Array<IKeyedSliderHandleValueProps<V>> {
        const handles = this.getHandles();
        return handles.sort((left, right) => left.value - right.value);
    }

    private getHandles(): Array<IKeyedSliderHandleValueProps<V>> {
        return getHandles(this.props);
    }
}

function getHandles<V extends ISliderValues>(props: IMultiRangeSliderProps<V>): Array<IKeyedSliderHandleValueProps<V>> {
    const { values, getHandleProps } = props;
    const handles: Array<IKeyedSliderHandleValueProps<V>> = [];
    for (const key in values) {
        if (values.hasOwnProperty(key)) {
            const value = values[key];
            const handleProps = Utils.isFunction(getHandleProps) ? Utils.safeInvoke(getHandleProps, key) : {};
            handles.push({
                key,
                value,
                ...handleProps,
            });
        }
    }
    return handles;
}

function argMin<T>(values: T[], argFn: (value: T) => any): T | undefined {
    if (values.length === 0) {
        return undefined;
    }

    let minValue = values[0];
    let minArg = argFn(minValue);

    for (let index = 1; index < values.length; index++) {
        const value = values[index];
        const arg = argFn(value);
        if (arg < minArg) {
            minValue = value;
            minArg = arg;
        }
    }

    return minValue;
}
