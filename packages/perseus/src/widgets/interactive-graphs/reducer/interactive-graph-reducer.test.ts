import invariant from "tiny-invariant";

import {
    moveControlPoint,
    movePoint,
    moveLine,
    changeSnapStep,
    changeRange,
    moveCenter,
    moveRadiusPoint,
    moveAll,
} from "./interactive-graph-action";
import {interactiveGraphReducer} from "./interactive-graph-reducer";

import type {GraphRange} from "../../../perseus-types";
import type {CircleGraphState, InteractiveGraphState} from "../types";

const baseSegmentGraphState: InteractiveGraphState = {
    hasBeenInteractedWith: false,
    type: "segment",
    range: [
        [-10, 10],
        [-10, 10],
    ],
    snapStep: [1, 1],
    coords: [],
};

const basePointGraphState: InteractiveGraphState = {
    hasBeenInteractedWith: false,
    type: "point",
    range: [
        [-10, 10],
        [-10, 10],
    ],
    snapStep: [1, 1],
    coords: [],
};

const baseCircleGraphState: InteractiveGraphState = {
    hasBeenInteractedWith: false,
    type: "circle",
    range: [
        [-10, 10],
        [-10, 10],
    ],
    snapStep: [1, 1],
    center: [0, 0],
    radiusPoint: [2, 0],
};

const baseSinusoidGraphState: InteractiveGraphState = {
    hasBeenInteractedWith: false,
    type: "sinusoid",
    range: [
        [-10, 10],
        [-10, 10],
    ],
    snapStep: [1, 1],
    coords: [
        [0, 0],
        [1, 1],
    ],
};

const baseQuadraticGraphState: InteractiveGraphState = {
    hasBeenInteractedWith: false,
    type: "quadratic",
    range: [
        [-10, 10],
        [-10, 10],
    ],
    snapStep: [1, 1],
    coords: [
        [-1, 1],
        [0, 0],
        [1, 1],
    ],
};

const basePolygonGraphState: InteractiveGraphState = {
    hasBeenInteractedWith: false,
    type: "polygon",
    showAngles: false,
    showSides: false,
    snapTo: "grid",
    range: [
        [-10, 10],
        [-10, 10],
    ],
    snapStep: [1, 1],
    coords: [
        [0, 0],
        [0, 1],
        [1, 0],
    ],
};

describe("moveControlPoint", () => {
    it("moves the given point", () => {
        const state: InteractiveGraphState = {
            ...baseSegmentGraphState,
            coords: [
                [
                    [1, 2],
                    [3, 4],
                ],
            ],
        };

        const updated = interactiveGraphReducer(
            state,
            moveControlPoint(0, [5, 6], 0),
        );

        invariant(updated.type === "segment");
        expect(updated.coords[0]).toEqual([
            [5, 6],
            [3, 4],
        ]);
    });

    it("sets hasBeenInteractedWith", () => {
        const state: InteractiveGraphState = {
            ...baseSegmentGraphState,
            coords: [
                [
                    [1, 2],
                    [3, 4],
                ],
            ],
        };

        const updated = interactiveGraphReducer(
            state,
            moveControlPoint(0, [5, 6], 0),
        );

        expect(updated.hasBeenInteractedWith).toBe(true);
    });

    it("does not allow moving the endpoints of a segment to the same location", () => {
        const state: InteractiveGraphState = {
            ...baseSegmentGraphState,
            coords: [
                [
                    [1, 1],
                    [2, 2],
                ],
            ],
        };

        const updated = interactiveGraphReducer(
            state,
            moveControlPoint(0, [2, 2], 0),
        );

        invariant(updated.type === "segment");
        // Assert: the move was canceled
        expect(updated.coords[0]).toEqual([
            [1, 1],
            [2, 2],
        ]);
    });

    it("does not allow moving the endpoints of a sinusoid to the same x location", () => {
        const state: InteractiveGraphState = {
            ...baseSinusoidGraphState,
            coords: [
                [1, 1],
                [2, 2],
            ],
        };

        const updated = interactiveGraphReducer(state, movePoint(0, [2, 1]));

        invariant(updated.type === "sinusoid");
        // Assert: the move was canceled
        expect(updated.coords).toEqual([
            [1, 1],
            [2, 2],
        ]);
    });

    it("snaps points to the snap grid", () => {
        const state: InteractiveGraphState = {
            ...baseSegmentGraphState,
            snapStep: [1, 2],
            coords: [
                [
                    [1, 2],
                    [3, 4],
                ],
            ],
        };

        const updated = interactiveGraphReducer(
            state,
            moveControlPoint(0, [1.5, 6.6], 0),
        );

        // Assert
        invariant(updated.type === "segment");
        // x snaps to the nearest whole number; y snaps to the nearest
        // multiple of 2.
        expect(updated.coords[0][0]).toEqual([2, 6]);
    });

    it("constrains points to be at least one snap step within the graph bounds", () => {
        const state: InteractiveGraphState = {
            ...baseSegmentGraphState,
            snapStep: [0.5, 0.5],
            range: [
                [-5, 5],
                [-8, 8],
            ],
            coords: [
                [
                    [1, 2],
                    [3, 4],
                ],
            ],
        };

        const updated = interactiveGraphReducer(
            state,
            moveControlPoint(0, [99, 99], 0),
        );

        invariant(updated.type === "segment");
        expect(updated.coords[0][0]).toEqual([4.5, 7.5]);
    });
});

describe("moveSegment", () => {
    it("moves an entire segment by the given delta vector", () => {
        const state: InteractiveGraphState = {
            ...baseSegmentGraphState,
            coords: [
                [
                    [1, 2],
                    [3, 4],
                ],
            ],
        };

        const updated = interactiveGraphReducer(state, moveLine(0, [5, -3]));

        invariant(updated.type === "segment");
        expect(updated.coords[0]).toEqual([
            [6, -1],
            [8, 1],
        ]);
    });

    it("snaps to the snap grid", () => {
        const state: InteractiveGraphState = {
            ...baseSegmentGraphState,
            coords: [
                [
                    [1, 2],
                    [3, 4],
                ],
            ],
        };

        const updated = interactiveGraphReducer(state, moveLine(0, [0.5, 0.5]));

        invariant(updated.type === "segment");
        expect(updated.coords[0]).toEqual([
            [2, 3],
            [4, 5],
        ]);
    });

    it("keeps the segment within the graph bounds", () => {
        const state: InteractiveGraphState = {
            ...baseSegmentGraphState,
            coords: [
                [
                    [1, 2],
                    [3, 4],
                ],
            ],
        };

        const updated = interactiveGraphReducer(state, moveLine(0, [99, 99]));

        invariant(updated.type === "segment");
        expect(updated.coords[0]).toEqual([
            [7, 7],
            [9, 9],
        ]);
    });

    it("sets hasBeenInteractedWith", () => {
        const state: InteractiveGraphState = {
            ...baseSegmentGraphState,
            coords: [
                [
                    [1, 2],
                    [3, 4],
                ],
            ],
        };

        const updated = interactiveGraphReducer(state, moveLine(0, [1, 1]));

        expect(updated.hasBeenInteractedWith).toBe(true);
    });
});

describe("movePoint on a point graph", () => {
    it("moves the point with the given index", () => {
        const state: InteractiveGraphState = {
            ...basePointGraphState,
            coords: [
                [1, 2],
                [3, 4],
            ],
        };

        const updated = interactiveGraphReducer(state, movePoint(0, [5, 6]));

        invariant(updated.type === "point");
        expect(updated.coords[0]).toEqual([5, 6]);
    });

    it("snaps to the snap grid", () => {
        const state: InteractiveGraphState = {
            ...basePointGraphState,
            snapStep: [3, 4],
            coords: [[0, 0]],
        };

        const updated = interactiveGraphReducer(
            state,
            movePoint(0, [-2, -2.5]),
        );

        invariant(updated.type === "point");
        expect(updated.coords[0]).toEqual([-3, -4]);
    });

    it("keeps points within the graph bounds", () => {
        const state: InteractiveGraphState = {
            ...basePointGraphState,
            coords: [[0, 0]],
        };

        const updated = interactiveGraphReducer(state, movePoint(0, [99, 99]));

        invariant(updated.type === "point");
        expect(updated.coords[0]).toEqual([9, 9]);
    });

    it("sets hasBeenInteractedWith", () => {
        const state: InteractiveGraphState = {
            ...basePointGraphState,
            coords: [[1, 2]],
        };

        const updated = interactiveGraphReducer(state, movePoint(0, [1, 1]));

        expect(updated.hasBeenInteractedWith).toBe(true);
    });
});

describe("movePoint on a polygon graph", () => {
    it("moves a point", () => {
        const state: InteractiveGraphState = {
            ...basePolygonGraphState,
            coords: [
                [0, 0],
                [0, 2],
                [2, 2],
                [2, 0],
            ],
        };

        const updated = interactiveGraphReducer(state, movePoint(0, [0, 1]));

        invariant(updated.type === "polygon");
        expect(updated.coords[0]).toEqual([0, 1]);
    });

    it("rejects the move if it would cause sides of the polygon to intersect with grid snapping", () => {
        const state: InteractiveGraphState = {
            ...basePolygonGraphState,
            coords: [
                [0, 0],
                [0, 2],
                [2, 2],
                [2, 0],
            ],
        };

        const updated = interactiveGraphReducer(state, movePoint(0, [1, 3]));

        invariant(updated.type === "polygon");
        expect(updated.coords[0]).toEqual([0, 0]);
    });

    it("rejects the move if it would cause sides of the polygon to intersect with angles snapping", () => {
        const state: InteractiveGraphState = {
            ...basePolygonGraphState,
            snapTo: "angles",
            coords: [
                [0, 0],
                [0, 2],
                [2, 2],
                [2, 0],
            ],
        };

        const updated = interactiveGraphReducer(state, movePoint(0, [1, 3]));

        invariant(updated.type === "polygon");
        expect(updated.coords[0]).toEqual([0, 0]);
    });

    it("does not snap to grid when snapTo is angles using moveAll", () => {
        const state: InteractiveGraphState = {
            ...basePolygonGraphState,
            snapTo: "angles",
            coords: [
                [0, 0],
                [0, 2],
                [2, 2],
                [2, 0],
            ],
        };

        // Move all points less than a snapStep to show they are not snapping
        const updated = interactiveGraphReducer(state, moveAll([0.3, 0]));

        invariant(updated.type === "polygon");
        expect(updated.coords[0]).toEqual([0.3, 0]);
    });

    // Since the graph is snapping to angles, example points to move must be very specific
    it("does not snap to grid when snapTo is angles using movePoint", () => {
        const state: InteractiveGraphState = {
            ...basePolygonGraphState,
            snapTo: "angles",
            coords: [
                [3.1788177497461882, -2.95030212474619],
                [2.828427124746188, 2.828427124746188],
                [-2.82842712474619, 2.828427124746188],
                [-2.8284271247461916, -2.82842712474619],
            ],
        };

        const updated = interactiveGraphReducer(state, movePoint(0, [3, -2]));

        invariant(updated.type === "polygon");
        expect(updated.coords[0]).toEqual([
            2.997376981064699, -2.009663752902908,
        ]);
    });
});

describe("movePoint on a quadratic graph", () => {
    it("moves a point", () => {
        const state: InteractiveGraphState = baseQuadraticGraphState;

        const updated = interactiveGraphReducer(state, movePoint(0, [-2, 4]));

        invariant(updated.type === "quadratic");
        expect(updated.coords[0]).toEqual([-2, 4]);
    });

    it("rejects the move if when new coordinates would invalidate the graph", () => {
        const state: InteractiveGraphState = {
            ...baseQuadraticGraphState,
            coords: [
                [-5, 5],
                [0, -5],
                [5, 5],
            ],
        };

        // An invalid graph happens when the denominator is 0 and are unable to calculate
        // quadratic coefficients as they hit infinity.
        // For more details see the getQuadraticCoefficients function that performs this calculation.
        const updated = interactiveGraphReducer(state, movePoint(0, [0, 0]));

        invariant(updated.type === "quadratic");
        expect(updated.coords[0]).toEqual([-5, 5]);
    });
});

describe("doChangeSnapStep", () => {
    it("doesn't update if there are no changes", () => {
        const state: InteractiveGraphState = {
            ...baseSegmentGraphState,
        };

        const updated = interactiveGraphReducer(
            state,
            changeSnapStep(state.snapStep),
        );

        // make sure the state object is the same
        expect(state).toBe(updated);
    });

    it("does update if there are changes", () => {
        const state: InteractiveGraphState = {
            ...baseSegmentGraphState,
        };

        const next: [number, number] = [5, 5];
        const updated = interactiveGraphReducer(state, changeSnapStep(next));

        // make sure the state object is different
        expect(state).not.toBe(updated);
        expect(updated.snapStep).toEqual(next);
    });
});

describe("doChangeRange", () => {
    it("doesn't update if there are no changes", () => {
        const state: InteractiveGraphState = {
            ...baseSegmentGraphState,
        };

        const updated = interactiveGraphReducer(
            state,
            changeRange(state.range),
        );

        // make sure the state object is the same
        expect(state).toBe(updated);
    });

    it("does update if there are changes", () => {
        const state: InteractiveGraphState = {
            ...baseSegmentGraphState,
        };

        const next: GraphRange = [
            [-20, 20],
            [-20, 20],
        ];
        const updated = interactiveGraphReducer(state, changeRange(next));

        // make sure the state object is different
        expect(state).not.toBe(updated);
        expect(updated.range).toEqual(next);
    });
});

describe("moveCenter", () => {
    it("moves the center", () => {
        const state: InteractiveGraphState = {
            ...baseCircleGraphState,
        };

        const updated = interactiveGraphReducer(state, moveCenter([1, 1]));

        // make sure the state object is different
        expect(state).not.toBe(updated);
        expect((updated as CircleGraphState).center).toEqual([1, 1]);
    });

    it("sets hasBeenInteractedWith", () => {
        const state: InteractiveGraphState = {
            ...baseCircleGraphState,
        };

        const updated = interactiveGraphReducer(state, moveCenter([1, 1]));

        expect(updated.hasBeenInteractedWith).toBe(true);
    });

    it("constrains the center to the range", () => {
        const state: InteractiveGraphState = {
            ...baseCircleGraphState,
        };

        const updated = interactiveGraphReducer(state, moveCenter([11, 11]));

        // make sure the state object is different
        expect(state).not.toBe(updated);
        expect((updated as CircleGraphState).center).toEqual([9, 9]);
    });

    it("updates the radius", () => {
        const state: InteractiveGraphState = {
            ...baseCircleGraphState,
        };

        const updated = interactiveGraphReducer(state, moveCenter([1, 1]));

        // make sure the state object is different
        expect(state).not.toBe(updated);
        expect((updated as CircleGraphState).radiusPoint).toEqual([3, 1]);
    });

    it("swaps radius sides when needed", () => {
        const state: InteractiveGraphState = {
            ...baseCircleGraphState,
        };

        const updated = interactiveGraphReducer(state, moveCenter([9, 0]));

        // make sure the state object is different
        expect(state).not.toBe(updated);
        expect((updated as CircleGraphState).radiusPoint).toEqual([7, 0]);
    });

    it("throws for non-circle graphs", () => {
        const state: InteractiveGraphState = {
            ...baseSegmentGraphState,
        };

        expect(() =>
            interactiveGraphReducer(state, moveCenter([1, 1])),
        ).toThrow();
    });
});

describe("doMoveRadiusPoint", () => {
    it("updates radius", () => {
        const state: InteractiveGraphState = {
            ...baseCircleGraphState,
        };

        const updated = interactiveGraphReducer(state, moveRadiusPoint([5, 0]));

        // make sure the state object is different
        expect(state).not.toBe(updated);
        expect((updated as CircleGraphState).radiusPoint).toEqual([5, 0]);
    });

    it("sets hasBeenInteractedWith", () => {
        const state: InteractiveGraphState = {
            ...baseCircleGraphState,
        };

        const updated = interactiveGraphReducer(state, moveRadiusPoint([4, 0]));

        expect(updated.hasBeenInteractedWith).toBe(true);
    });

    it("constrains to range", () => {
        const state: InteractiveGraphState = {
            ...baseCircleGraphState,
        };

        const updated = interactiveGraphReducer(
            state,
            moveRadiusPoint([20, 0]),
        );

        // make sure the state object is different
        expect(state).not.toBe(updated);
        expect((updated as CircleGraphState).radiusPoint).toEqual([10, 0]);
    });

    it("locks y axis", () => {
        const state: InteractiveGraphState = {
            ...baseCircleGraphState,
        };

        const updated = interactiveGraphReducer(
            state,
            moveRadiusPoint([2, 20]),
        );

        // make sure the state object is different
        expect(state).not.toBe(updated);
        expect((updated as CircleGraphState).radiusPoint).toEqual([2, 0]);
    });

    it("throws for non-circle graphs", () => {
        const state: InteractiveGraphState = {
            ...baseSegmentGraphState,
        };

        expect(() =>
            interactiveGraphReducer(state, moveRadiusPoint([5, 0])),
        ).toThrow();
    });
});
