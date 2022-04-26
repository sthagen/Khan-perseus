// @flow
/**
 * Controlled list of answer choices, handles adding and removing answers.
 */

import {StyleSheet, css} from "aphrodite";
import * as React from "react";

import Link from "../../../components/link-package/link.jsx";
import FormWrappedTextField from "../../../components/text-inputs-package/form-wrapped-text-field.jsx";
import {
    colors,
    typography,
} from "../../../shared-styles-package/global-styles.js";
import Icon from "../../../shared-styles-package/icon.jsx";

type AddAnswerProps = {
    // Callback to add new answer choice.
    onClick: () => void,
    ...
};

type AnswerProps = {
    // The answer string, can be plain text or a KaTeX expression.
    answer: string,
    // Callback for when an answer is changed.
    onChange: (answer: string) => void,
    // Callback to remove answer from list of choices.
    onRemove: () => void,
    ...
};

type AnswerChoicesProps = {
    // The list of possible answers in a specific order.
    choices: $ReadOnlyArray<string>,
    // Callback for when answers change.
    onChange: (choices: $ReadOnlyArray<string>) => void,
    ...
};

const addIcon = {
    path: "M11 11V7a1 1 0 0 1 2 0v4h4a1 1 0 0 1 0 2h-4v4a1 1 0 0 1-2 0v-4H7a1 1 0 0 1 0-2h4zm1 13C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-2c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
    width: 24,
    height: 24,
};

const removeIcon = {
    path: "M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm0-2c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm-5-9a1 1 0 0 1 0-2h10a1 1 0 0 1 0 2H7z",
    width: 24,
    height: 24,
};

const DraggableGripIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16">
        <filter
            id="draggable-grip-shadow"
            width="112.5%"
            height="116.7%"
            x="-6.2%"
            y="-8.3%"
            filterUnits="objectBoundingBox"
        >
            <feGaussianBlur
                in="SourceAlpha"
                stdDeviation=".5"
                result="shadowBlurInner"
            />

            <feOffset in="shadowBlurInner" dy="1" result="shadowOffsetInner" />

            <feComposite
                in="shadowOffsetInner"
                in2="SourceAlpha"
                k2="-1"
                k3="1"
                operator="arithmetic"
                result="shadowInnerInner"
            />

            <feColorMatrix
                in="shadowInnerInner"
                values="0 0 0 0 0.129411765 0 0 0 0 0.141176471 0 0 0 0 0.17254902 0 0 0 0.2 0"
            />
        </filter>

        <path
            d="M1 4a1 1 0 1 1 0-2h14a1 1 0 0 1 0 2H1zm0 10a1 1 0 0 1 0-2h14a1 1 0 0 1 0 2H1zm0-5a1 1 0 1 1 0-2h14a1 1 0 0 1 0 2H1z"
            fill={colors.gray17}
            filter="url(#draggable-grip-shadow)"
        />
    </svg>
);

/**
 * A button link to add a new answer.
 */
const AddAnswer = ({onClick}: AddAnswerProps) => (
    <Link
        className={css(styles.addAnswer, editorStyles.addAnswer)}
        onClick={onClick}
    >
        <Icon icon={addIcon} size={24} />
        <div className={css(styles.spacer)} />
        Add an answer choice
    </Link>
);

/**
 * An answer item in the choices list.
 *
 * TODO(michaelpolyak): Implement answer reordering, CP-117
 */
const Answer = ({answer, onChange, onRemove}: AnswerProps) => (
    <li className={css(styles.answer)}>
        <Link onClick={onRemove}>
            <Icon icon={removeIcon} size={24} color="#D92916" />
        </Link>

        <div className={css(styles.spacer)} />

        <FormWrappedTextField
            grow={1}
            onChange={(e) => onChange(e.target.value)}
            value={answer}
        />

        <div className={css(styles.spacer)} />

        <Link
            style={[styles.disabled]}
            title="Answer reordering is not implemented."
        >
            <DraggableGripIcon />
        </Link>
    </li>
);

/**
 * The list of choices, handles adding, removing and reording of answers.
 */
const AnswerChoices = ({
    choices,
    onChange,
}: AnswerChoicesProps): React.Element<"div"> => (
    <div>
        <div className={css(styles.title)}>Answer Choices</div>

        <ul className={css(styles.answers)}>
            {choices.map((answer, index) => (
                <Answer
                    answer={answer}
                    // TODO(michaelpolyak): When answer reording is implemented,
                    // key by index may not re-render correctly, CP-117
                    key={index}
                    // Update answer for choice.
                    onChange={(answer) =>
                        onChange([
                            ...choices.slice(0, index),
                            answer,
                            ...choices.slice(index + 1),
                        ])
                    }
                    // Remove answer from choices.
                    onRemove={() =>
                        onChange([
                            ...choices.slice(0, index),
                            ...choices.slice(index + 1),
                        ])
                    }
                />
            ))}
        </ul>

        <AddAnswer
            // Append a new empty answer to choices.
            onClick={() => onChange([...choices, ""])}
        />
    </div>
);

const styles = StyleSheet.create({
    title: {
        ...typography.bodyXsmallBold,

        marginBottom: 6,

        color: colors.gray17,
    },

    answers: {
        marginTop: 12,
        marginBottom: 12,
    },

    answer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",

        ":not(:first-child)": {
            marginTop: 12,
        },
    },

    addAnswer: {
        ...typography.bodyXsmallBold,

        display: "flex",
        flexDirection: "row",
        alignItems: "center",

        color: "#1865f2",
    },

    spacer: {
        width: 16,
    },

    disabled: {
        cursor: "not-allowed",
    },
});

const editorStyles = StyleSheet.create({
    addAnswer: {
        ":link": {
            color: "#1865f2",
        },
    },
});

export default AnswerChoices;