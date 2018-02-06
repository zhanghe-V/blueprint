/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the terms of the LICENSE file distributed with this project.
 */

/**
 * The position (relative to the target) at which the element should appear.
 *
 * The default value of `"auto"` will choose the best position when opened
 * and will allow the popover to reposition itself to remain onscreen as the
 * user scrolls around.
 */
export type Position =
    | "auto"
    | "top-left"
    | "top"
    | "top-right"
    | "right-top"
    | "right"
    | "right-bottom"
    | "bottom-right"
    | "bottom"
    | "bottom-left"
    | "left-bottom"
    | "left"
    | "left-top";
export const Position = {
    AUTO: "auto" as "auto",
    BOTTOM: "bottom" as "bottom",
    BOTTOM_LEFT: "bottom-left" as "bottom-left",
    BOTTOM_RIGHT: "bottom-right" as "bottom-right",
    LEFT: "left" as "left",
    LEFT_BOTTOM: "left-bottom" as "left-bottom",
    LEFT_TOP: "left-top" as "left-top",
    RIGHT: "right" as "right",
    RIGHT_BOTTOM: "right-bottom" as "right-bottom",
    RIGHT_TOP: "right-top" as "right-top",
    TOP: "top" as "top",
    TOP_LEFT: "top-left" as "top-left",
    TOP_RIGHT: "top-right" as "top-right",
};
