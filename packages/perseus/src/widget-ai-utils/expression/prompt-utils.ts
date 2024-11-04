import type {PerseusExpressionUserInput} from "../../validation.types";
import type expression from "../../widgets/expression/expression";
import type React from "react";

export type ExpressionPromptJSON = {
    type: "expression";
    label?: string;
    userInput: {
        value: string;
    };
};

export const getPromptJSON = (
    renderProps: React.ComponentProps<typeof expression.widget>,
    userInput: PerseusExpressionUserInput,
): ExpressionPromptJSON => {
    return {
        type: "expression",
        label: renderProps.visibleLabel,
        userInput: {
            value: userInput,
        },
    };
};
