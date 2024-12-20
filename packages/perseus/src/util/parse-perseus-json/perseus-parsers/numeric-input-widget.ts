import {
    constant,
    object,
    array,
    string,
    number,
    optional,
    enumeration,
    boolean,
    nullable,
} from "../general-purpose-parsers";
import {defaulted} from "../general-purpose-parsers/defaulted";

import {parseWidget} from "./widget";

import type {NumericInputWidget} from "../../../perseus-types";
import type {Parser} from "../parser-types";

const parseMathFormat = enumeration(
    "integer",
    "mixed",
    "improper",
    "proper",
    "decimal",
    "percent",
    "pi",
);

export const parseNumericInputWidget: Parser<NumericInputWidget> = parseWidget(
    constant("numeric-input"),
    object({
        answers: array(
            object({
                message: string,
                value: optional(number),
                status: string,
                answerForms: optional(array(parseMathFormat)),
                strict: boolean,
                maxError: optional(nullable(number)),
                simplify: optional(nullable(string)),
            }),
        ),
        labelText: optional(string),
        size: string,
        coefficient: boolean,
        rightAlign: optional(boolean),
        static: defaulted(boolean, () => false),
        answerForms: optional(
            array(
                object({
                    name: parseMathFormat,
                    simplify: optional(
                        nullable(
                            enumeration(
                                "required",
                                "correct",
                                "enforced",
                                "optional",
                            ),
                        ),
                    ),
                }),
            ),
        ),
    }),
);
