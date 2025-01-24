import type {PerseusPassageRefTargetWidgetOptions} from "../../data-schema";
import type {WidgetLogic} from "../logic-export.types";

export type PassageRefTargetDefaultWidgetOptions = Pick<
    PerseusPassageRefTargetWidgetOptions,
    "content"
>;

const defaultWidgetOptions: PassageRefTargetDefaultWidgetOptions = {
    content: "",
};

const passageRefTargetWidgetLogic: WidgetLogic = {
    name: "passageRefTarget",
    defaultWidgetOptions,
};

export default passageRefTargetWidgetLogic;
