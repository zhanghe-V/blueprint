/*
 * Copyright 2015 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the terms of the LICENSE file distributed with this project.
 */

/**
 * The four basic intents.
 */
export type Intent = "none" | "primary" | "success" | "warning" | "danger";
export const Intent = {
    DANGER: "danger" as "danger",
    NONE: "none" as "none",
    PRIMARY: "primary" as "primary",
    SUCCESS: "success" as "success",
    WARNING: "warning" as "warning",
};
