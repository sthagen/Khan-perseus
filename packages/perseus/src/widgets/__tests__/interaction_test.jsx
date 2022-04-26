// @flow

import * as Dependencies from "../../../perseus-all-package/dependencies.js";
import {renderQuestion} from "../../../perseus-all-package/widgets/__tests__/renderQuestion.jsx";
import {testDependencies} from "../../../perseus-testing/test-dependencies.js";
import {question1} from "../__testdata__/interaction_testdata.js";

describe("interaction widget", () => {
    beforeEach(() => {
        jest.spyOn(Dependencies, "getDependencies").mockReturnValue(
            testDependencies,
        );
    });

    it("should render", () => {
        // Arrange/Act
        const {container} = renderQuestion(question1);

        // Assert
        expect(container).toMatchSnapshot();
    });

    it("should be unanswerable", () => {
        // Arrange/Act
        const {renderer} = renderQuestion(question1);

        // Assert
        // Note that this widget can never be answered correctly, no matter
        // what state its in.
        expect(renderer).toHaveBeenAnsweredIncorrectly();
    });
});
