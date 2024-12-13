import {filterNonEmpty} from "./utils";

import type {ValidationResult} from "../../types";
import type {PerseusTableUserInput} from "../../validation.types";

function validateTable(userInput: PerseusTableUserInput): ValidationResult {
    const supplied = filterNonEmpty(userInput);

    const hasEmptyCell = supplied.some(function (row) {
        return row.some(function (cell) {
            return cell === "";
        });
    });

    if (hasEmptyCell || !supplied.length) {
        return {
            type: "invalid",
            message: null,
        };
    }

    return null;
}

export default validateTable;
