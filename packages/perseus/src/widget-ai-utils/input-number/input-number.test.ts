import {screen} from "@testing-library/react";
import {userEvent as userEventLib} from "@testing-library/user-event";

import {renderQuestion} from "../../widgets/__testutils__/renderQuestion";

import type {InputNumberWidget, PerseusRenderer} from "../../perseus-types";
import type {UserEvent} from "@testing-library/user-event";

const question: PerseusRenderer = {
    content:
        "A sequence is defined recursively as follows:\n\n\n$\\qquad\\displaystyle{{a}_{n}}=-\\frac{1}{a_{n-1}-1} \n~~~~~~\\text{ with}\\qquad\\displaystyle{{a}_{0}}=\\frac{1}{2}\\,$\n\n\nFind the term $a_3$ in the sequence.\n\n[[\u2603 input-number 1]]",
    images: {},
    widgets: {
        "input-number 1": {
            graded: true,
            version: {
                major: 0,
                minor: 0,
            },
            static: false,
            type: "input-number",
            options: {
                maxError: 0.1,
                inexact: false,
                value: 0.5,
                simplify: "required",
                answerType: "number",
                size: "normal",
            },
            alignment: "default",
        } as InputNumberWidget,
    },
};

describe("input-number widget", () => {
    let userEvent: UserEvent;
    beforeEach(() => {
        userEvent = userEventLib.setup({
            advanceTimers: jest.advanceTimersByTime,
        });
    });

    it("should get prompt json which matches the state of the UI", async () => {
        // Arrange
        const {renderer} = renderQuestion(question);

        // Act
        const input = "40";
        const textbox = screen.getByRole("textbox");
        await userEvent.click(textbox);
        await userEvent.type(textbox, input);
        const json = renderer.getPromptJSON();

        // Assert
        expect(json).toEqual({
            content:
                "A sequence is defined recursively as follows:\n\n\n$\\qquad\\displaystyle{{a}_{n}}=-\\frac{1}{a_{n-1}-1} \n~~~~~~\\text{ with}\\qquad\\displaystyle{{a}_{0}}=\\frac{1}{2}\\,$\n\n\nFind the term $a_3$ in the sequence.\n\n[[\u2603 input-number 1]]",
            widgets: {
                "input-number 1": {
                    type: "input-number",
                    options: {
                        simplify: "required",
                        answerType: "number",
                    },
                    userInput: {
                        value: "40",
                    },
                },
            },
        });
    });
});
