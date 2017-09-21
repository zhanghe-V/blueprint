/**
 * Copyright 2017 Palantir Technologies, Inc. All rights reserved.
 * Licensed under the BSD-3 License as modified (the “License”); you may obtain a copy
 * of the license at https://github.com/palantir/blueprint/blob/master/LICENSE
 * and https://github.com/palantir/blueprint/blob/master/PATENTS
 */

import { QuadrantType } from "../../quadrants/tableQuadrant";
import { IRegion, RegionCardinality, Regions } from "../../regions";
import { Grid } from "../grid";
import { Rect } from "../rect";

/**
 * Returns CSS styles for an overlay that will be positioned over the body.
 * Based on the region cardinality, this function will adjust overlay borders to
 * align with styles returned from other get___OverlayStyle functions.
 */
export function getBodyOverlayStyle(
    region: IRegion,
    grid: Grid,
    quadrantType: QuadrantType,
    numFrozenColumns: number,
): React.CSSProperties {
    const cardinality = Regions.getRegionCardinality(region);
    const style = grid.getRegionStyle(region);

    // ensure we're not showing borders at the boundary of the frozen-columns area
    const canHideRightBorder =
        (quadrantType === QuadrantType.TOP_LEFT || quadrantType === QuadrantType.LEFT) &&
        numFrozenColumns != null &&
        numFrozenColumns > 0;

    const fixedHeight = grid.getHeight();
    const fixedWidth = grid.getWidth();

    // include a correction in some cases to hide borders along quadrant boundaries
    const alignmentCorrection = 1;
    const alignmentCorrectionString = `-${alignmentCorrection}px`;

    switch (cardinality) {
        case RegionCardinality.CELLS:
            return style;
        case RegionCardinality.FULL_COLUMNS:
            style.top = alignmentCorrectionString;
            style.height = fixedHeight + alignmentCorrection;
            return style;
        case RegionCardinality.FULL_ROWS:
            style.left = alignmentCorrectionString;
            style.width = fixedWidth + alignmentCorrection;
            if (canHideRightBorder) {
                style.right = alignmentCorrectionString;
            }
            return style;
        case RegionCardinality.FULL_TABLE:
            style.left = alignmentCorrectionString;
            style.top = alignmentCorrectionString;
            style.width = fixedWidth + alignmentCorrection;
            style.height = fixedHeight + alignmentCorrection;
            if (canHideRightBorder) {
                style.right = alignmentCorrectionString;
            }
            return style;
        default:
            return { display: "none" };
    }
}

/**
 * Returns CSS styles for an overlay that will be positioned over the menu
 * element in the top-left corner. Relevant only for FULL_TABLE regions.
 */
export function getMenuOverlayStyle(region: IRegion, grid: Grid, viewportRect: Rect): React.CSSProperties {
    if (viewportRect == null) {
        return {};
    }
    const cardinality = Regions.getRegionCardinality(region);
    const style = grid.getRegionStyle(region); // TODO: We overwrite everything, I think? Do we need this line?

    switch (cardinality) {
        case RegionCardinality.FULL_TABLE:
            style.right = "0px";
            style.bottom = "0px";
            style.top = "0px";
            style.left = "0px";
            style.borderBottom = "none";
            style.borderRight = "none";
            return style;
        default:
            return { display: "none" };
    }
}

/**
 * Returns CSS styles for an overlay that will be positioned over the column
 * header. Relevant only for FULL_TABLE and FULL_COLUMNS regions.
 */
export function getColumnHeaderOverlayStyle(region: IRegion, grid: Grid, viewportRect: Rect): React.CSSProperties {
    if (viewportRect == null) {
        return {};
    }
    const cardinality = Regions.getRegionCardinality(region);
    const style = grid.getRegionStyle(region);

    switch (cardinality) {
        case RegionCardinality.FULL_TABLE:
            style.left = "-1px";
            style.borderLeft = "none";
            style.bottom = "-1px";
            return style;
        case RegionCardinality.FULL_COLUMNS:
            style.bottom = "-1px";
            return style;
        default:
            return { display: "none" };
    }
}

/**
 * Returns CSS styles for an overlay that will be positioned over the row
 * header. Relevant only for FULL_TABLE and FULL_ROWS regions.
 */
export function getRowHeaderOverlayStyle(region: IRegion, grid: Grid, viewportRect: Rect): React.CSSProperties {
    if (viewportRect == null) {
        return {};
    }
    const cardinality = Regions.getRegionCardinality(region);
    const style = grid.getRegionStyle(region);
    switch (cardinality) {
        case RegionCardinality.FULL_TABLE:
            style.top = "-1px";
            style.borderTop = "none";
            style.right = "-1px";
            return style;
        case RegionCardinality.FULL_ROWS:
            style.right = "-1px";
            return style;
        default:
            return { display: "none" };
    }
}
