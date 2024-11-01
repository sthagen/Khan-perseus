import type {WidgetType} from "../../prompt-types";
import type {PerseusDropdownUserInput} from "../../validation.types";
import type dropdown from "../../widgets/dropdown/dropdown";
import type {PropsFor} from "@khanacademy/wonder-blocks-core";

type WidgetProps = PropsFor<typeof dropdown.widget>;

export type DropdownPromptJSON = {
    type: WidgetType;
    options: {
        items: WidgetProps["choices"];
    };
    userInput: {
        selectedIndex: PerseusDropdownUserInput["value"];
    };
};

export const getPromptJSON = (
    renderProps: WidgetProps,
    userInput: PerseusDropdownUserInput,
): DropdownPromptJSON => {
    return {
        type: "dropdown",
        options: {
            items: renderProps.choices,
        },
        userInput: {
            selectedIndex: userInput.value - 1, // Offset to account for placeholder
        },
    };
};
