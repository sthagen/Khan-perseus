import {
    generateTestPerseusItem,
    generateTestPerseusRenderer,
} from "@khanacademy/perseus-core";
import {act} from "@testing-library/react";

import {testDependencies} from "../../../../../testing/test-dependencies";
import {renderQuestion} from "../../__tests__/test-utils";
import * as Dependencies from "../../dependencies";
import {registerAllWidgetsForTesting} from "../../util/register-all-widgets-for-testing";

import type {PerseusItem} from "@khanacademy/perseus-core";

/**
 * [LEMS-3185] These are tests for the legacy Serialization API.
 *
 * This API is not built in a way that supports migrating data
 * between versions of Perseus JSON. In fact serialization
 * doesn't use WidgetOptions, but RenderProps; it's leveraging
 * what is considered an internal implementation detail to support
 * rehydrating previous state.
 *
 * The API is very fragile and likely broken. We have a ticket to remove it.
 * However we don't have the bandwidth to implement an alternative right now,
 * so I'm adding tests to make sure we're roughly still able to support
 * what little we've been supporting so far.
 *
 * This API needs to be removed and these tests need to be removed with it.
 */
describe("IFrame serialization", () => {
    function generateBasicIFrame(): PerseusItem {
        const question = generateTestPerseusRenderer({
            content: "[[☃ iframe 1]]",
            widgets: {
                "iframe 1": {
                    type: "iframe",
                    options: {
                        settings: [],
                        url: "https://hotmail.com",
                        height: "410",
                        width: "410",
                        allowFullScreen: true,
                        static: false,
                    },
                },
            },
        });
        const item = generateTestPerseusItem({question});
        return item;
    }

    beforeAll(() => {
        registerAllWidgetsForTesting();
    });

    beforeEach(() => {
        jest.spyOn(Dependencies, "getDependencies").mockReturnValue(
            testDependencies,
        );
    });

    afterEach(() => {
        // The Renderer uses a timer to wait for widgets to complete rendering.
        // If we don't spin the timers here, then the timer fires in the test
        // _after_ and breaks it because we do setState() in the callback,
        // and by that point the component has been unmounted.
        act(() => jest.runOnlyPendingTimers());
    });

    it("should serialize the current state", async () => {
        // Arrange
        const {renderer} = renderQuestion(generateBasicIFrame());

        // Act
        const state = renderer.getSerializedState();

        // Assert
        expect(state).toEqual({
            question: {
                "iframe 1": {
                    url: "https://hotmail.com",
                    settings: [],
                    width: "410",
                    height: "410",
                    allowFullScreen: true,
                    allowTopNavigation: false,
                    static: false,
                },
            },
            hints: [],
        });
    });

    it("should restore serialized state", () => {
        // Arrange
        const {renderer} = renderQuestion(generateBasicIFrame());

        // Act
        act(() =>
            renderer.restoreSerializedState({
                question: {
                    "iframe 1": {
                        settings: [],
                        url: "https://hotmail.com",
                        height: "410",
                        width: "410",
                        allowFullScreen: true,
                        status: "correct",
                        message: "cool message",
                        static: false,
                    },
                },
                hints: [],
            }),
        );

        const userInput = renderer.getUserInput();

        // Assert
        // `value` would be 0 if we didn't properly restore serialized state
        expect(userInput).toEqual({
            "iframe 1": {
                status: "correct",
                message: "cool message",
            },
        });
    });
});
