import {testDependencies} from "../../../../../testing/test-dependencies";
import {waitForInitialGraphieRender} from "../../../../../testing/wait";
import * as Dependencies from "../../dependencies";
import {renderQuestion} from "../__testutils__/renderQuestion";

import {
    linearQuestion,
    multipleAvailableTypesQuestion,
} from "./grapher.testdata";

describe("grapher widget", () => {
    beforeEach(() => {
        jest.spyOn(Dependencies, "getDependencies").mockReturnValue(
            testDependencies,
        );

        // Mocked for loading graphie in svg-image
        // TODO(LEMS-3083): Remove eslint suppression
        // eslint-disable-next-line functional/immutable-data
        global.fetch = jest.fn(() =>
            Promise.resolve({
                text: () => "",
                ok: true,
            }),
        ) as jest.Mock;
    });

    it("should snapshot linear graph question", async () => {
        // Arrange and Act
        const {container} = renderQuestion(linearQuestion);
        await waitForInitialGraphieRender();

        // Assert
        expect(container).toMatchSnapshot("initial render");
    });

    it("should snapshot question with multiple graph types", async () => {
        // Arrange and Act
        const {container} = renderQuestion(multipleAvailableTypesQuestion);
        await waitForInitialGraphieRender();

        // Assert
        expect(container).toMatchSnapshot("initial render");
    });
});
