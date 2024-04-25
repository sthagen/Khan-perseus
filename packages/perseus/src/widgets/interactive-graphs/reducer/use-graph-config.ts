import React, {createContext} from "react";

import type {Interval, vec} from "mafs";

type GraphConfig = {
    range: [Interval, Interval];
    snapStep: vec.Vector2;
    markings: "graph" | "grid" | "none";
    showTooltips: boolean;
    graphDimensionsInPixels: vec.Vector2;
    width: number; // pixels
    height: number; // pixels
    labels: readonly string[];
};

const defaultGraphConfig: GraphConfig = {
    range: [
        [0, 1],
        [0, 1],
    ],
    snapStep: [1, 1],
    markings: "none",
    showTooltips: false,
    graphDimensionsInPixels: [1, 1],
    width: 0,
    height: 0,
    labels: [],
};

export const GraphConfigContext =
    createContext<GraphConfig>(defaultGraphConfig);

export default function useGraphConfig(): GraphConfig {
    return React.useContext(GraphConfigContext);
}