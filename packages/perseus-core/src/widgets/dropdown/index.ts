import getDropdownPublicWidgetOptions from "./dropdown-util";

import type {PerseusDropdownWidgetOptions} from "../../data-schema";
import type {WidgetLogic} from "../logic-export.types";

export type DropdownDefaultWidgetOptions = Pick<
    PerseusDropdownWidgetOptions,
    "placeholder" | "choices"
>;

const defaultWidgetOptions: DropdownDefaultWidgetOptions = {
    placeholder: "",
    choices: [
        {
            content: "",
            correct: false,
        },
    ],
};

const dropdownWidgetLogic: WidgetLogic = {
    name: "definition",
    defaultWidgetOptions,
    defaultAlignment: "inline-block",
    getPublicWidgetOptions: getDropdownPublicWidgetOptions,
};

export default dropdownWidgetLogic;
