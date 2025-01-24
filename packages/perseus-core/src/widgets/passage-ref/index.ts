import {currentVersion, defaultWidgetOptions} from "./passage-ref-upgrade";

import type {WidgetLogic} from "../logic-export.types";

export type {PassageRefDefaultWidgetOptions} from "./passage-ref-upgrade";

const passageRefWidgetLogic: WidgetLogic = {
    name: "passageRef",
    version: currentVersion,
    defaultWidgetOptions: defaultWidgetOptions,
};

export default passageRefWidgetLogic;
