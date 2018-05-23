/*
 * Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 * 
 * Licensed under the terms of the LICENSE file distributed with this project.
 */

import * as React from "react";

import { Classes, Intent, ISliderHandleProps, Label, MultiRangeSlider, Switch } from "@blueprintjs/core";
import { Example, handleBooleanChange, handleStringChange, IExampleProps } from "@blueprintjs/docs-theme";

interface IIntentBounds {
    dangerStart: number;
    warningStart: number;
    warningEnd: number;
    dangerEnd: number;
}

type IntentOption = "danger" | "warning" | "both";
type TailOption = "lower" | "upper" | "both" | "neither";

interface IMultiSliderExampleState {
    intent: IntentOption;
    tail: TailOption;
    values?: IIntentBounds;
    vertical?: boolean;
}

export type ConcreteHandleProps = Pick<ISliderHandleProps, "trackIntentBefore" | "trackIntentAfter">;

const IntentBoundsSlider = MultiRangeSlider.ofType<Partial<IIntentBounds>>();

// tslint:disable:object-literal-sort-keys
export abstract class AbstractMultiSliderExample extends React.PureComponent<IExampleProps, IMultiSliderExampleState> {
    public state: IMultiSliderExampleState = {
        intent: "both",
        tail: "both",
        values: {
            dangerStart: 12,
            warningStart: 36,
            warningEnd: 72,
            dangerEnd: 90,
        },
        vertical: false,
    };

    private toggleVertical = handleBooleanChange(vertical => this.setState({ vertical }));
    private handleIntentChange = handleStringChange((intent: IntentOption) => this.setState({ intent }));
    private handleTailChange = handleStringChange((tail: TailOption) => this.setState({ tail }));

    public render() {
        return (
            <Example options={this.renderOptions()} {...this.props}>
                <IntentBoundsSlider
                    defaultTrackIntent={this.getDefaultTrackIntent()}
                    getHandleProps={this.getSliderHandlerProps}
                    min={0}
                    max={100}
                    stepSize={2}
                    labelStepSize={20}
                    onChange={this.handleChange}
                    vertical={this.state.vertical}
                    values={this.getSliderValues()}
                />
            </Example>
        );
    }

    protected abstract getDefaultTrackIntent(): Intent;
    protected abstract getDangerStartHandleProps(): ConcreteHandleProps;
    protected abstract getWarningStartHandleProps(): ConcreteHandleProps;
    protected abstract getWarningEndHandleProps(): ConcreteHandleProps;
    protected abstract getDangerEndHandleProps(): ConcreteHandleProps;

    private getSliderHandlerProps = (key: keyof IIntentBounds): ISliderHandleProps => {
        switch (key) {
            case "dangerStart":
                return { type: "start", ...this.getDangerStartHandleProps() };
            case "warningStart":
                return { type: "start", ...this.getWarningStartHandleProps() };
            case "warningEnd":
                return { type: "end", ...this.getWarningEndHandleProps() };
            case "dangerEnd":
                return { type: "end", ...this.getDangerEndHandleProps() };
        }
    };

    private getSliderValues(): Partial<IIntentBounds> {
        return {
            ...this.getDangerStartHandleValue(),
            ...this.getWarningStartHandleValue(),
            ...this.getWarningEndHandleValue(),
            ...this.getDangerEndHandleValue(),
        };
    }

    private getDangerStartHandleValue() {
        const { intent, tail, values } = this.state;
        if (intent === "warning" || tail === "upper" || tail === "neither") {
            return {};
        }
        return { dangerStart: values.dangerStart };
    }

    private getWarningStartHandleValue() {
        const { intent, tail, values } = this.state;
        if (intent === "danger" || tail === "upper" || tail === "neither") {
            return {};
        }
        return { warningStart: values.warningStart };
    }

    private getWarningEndHandleValue() {
        const { intent, tail, values } = this.state;
        if (intent === "danger" || tail === "lower" || tail === "neither") {
            return {};
        }
        return { warningEnd: values.warningEnd };
    }

    private getDangerEndHandleValue() {
        const { intent, tail, values } = this.state;
        if (intent === "warning" || tail === "lower" || tail === "neither") {
            return {};
        }
        return { dangerEnd: values.dangerEnd };
    }

    private renderOptions() {
        return (
            <>
                <Switch checked={this.state.vertical} label="Vertical" onChange={this.toggleVertical} />
                <Label text="Intent">
                    <div className={Classes.SELECT}>
                        <select value={this.state.intent} onChange={this.handleIntentChange}>
                            <option value="both">Both</option>
                            <option value="warning">Warning</option>
                            <option value="danger">Danger</option>
                        </select>
                    </div>
                </Label>
                <Label text="Tail">
                    <div className={Classes.SELECT}>
                        <select value={this.state.tail} onChange={this.handleTailChange}>
                            <option value="both">Both</option>
                            <option value="lower">Lower</option>
                            <option value="upper">Upper</option>
                            <option value="neither">Neither</option>
                        </select>
                    </div>
                </Label>
            </>
        );
    }

    private handleChange = (updatedValues: Partial<IIntentBounds>) => {
        const valuesMap = { ...this.state.values, ...updatedValues };
        const valuesArray = Object.keys(valuesMap).map((key: keyof IIntentBounds) => valuesMap[key]);
        valuesArray.sort((a, b) => a - b);
        const [dangerStart, warningStart, warningEnd, dangerEnd] = valuesArray;
        const values = { dangerStart, warningStart, warningEnd, dangerEnd };
        this.setState({ values });
    };
}
