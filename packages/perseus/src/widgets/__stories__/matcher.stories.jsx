// @flow
import * as React from "react";

import {RendererWithDebugUI} from "../../../perseus-testing/renderer-with-debug-ui.jsx";
import {question1} from "../__testdata__/matcher_testdata.js";

export default {
    title: "Perseus/Widgets/Matcher",
};

type StoryArgs = {||};

export const Question1 = (args: StoryArgs): React.Node => {
    return <RendererWithDebugUI question={question1} />;
};