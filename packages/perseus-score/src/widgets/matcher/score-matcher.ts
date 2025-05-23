import _ from "underscore";

import type {
    PerseusMatcherRubric,
    PerseusMatcherUserInput,
    PerseusScore,
} from "@khanacademy/perseus-core";

function scoreMatcher(
    userInput: PerseusMatcherUserInput,
    rubric: PerseusMatcherRubric,
): PerseusScore {
    const correct =
        _.isEqual(userInput.left, rubric.left) &&
        _.isEqual(userInput.right, rubric.right);

    return {
        type: "points",
        earned: correct ? 1 : 0,
        total: 1,
        message: null,
    };
}

export default scoreMatcher;
