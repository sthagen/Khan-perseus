import * as KAS from "@khanacademy/kas";
import {
    components,
    Changeable,
    Expression,
    PerseusExpressionAnswerFormConsidered,
} from "@khanacademy/perseus";
import Button from "@khanacademy/wonder-blocks-button";
import {Checkbox, LabeledTextField} from "@khanacademy/wonder-blocks-form";
import {Strut} from "@khanacademy/wonder-blocks-layout";
import {color, spacing} from "@khanacademy/wonder-blocks-tokens";
import {
    HeadingSmall,
    HeadingXSmall,
} from "@khanacademy/wonder-blocks-typography";
import {isTruthy} from "@khanacademy/wonder-stuff-core";
import {css, StyleSheet} from "aphrodite";
// eslint-disable-next-line import/no-extraneous-dependencies
import lens from "hubble";
import * as React from "react";
import _ from "underscore";

import SortableArea from "../components/sortable";

import type {
    PerseusExpressionWidgetOptions,
    LegacyButtonSets,
} from "@khanacademy/perseus";

const {InfoTip} = components;

type Props = {
    widgetId?: any;
    value?: string;
} & Omit<PerseusExpressionWidgetOptions, "buttonsVisible"> &
    Changeable.ChangeableProps;

// types for iterables
type AnswerForm = PerseusExpressionWidgetOptions["answerForms"][number];
type LegacyButtonSet = PerseusExpressionWidgetOptions["buttonSets"][number];

type DefaultProps = {
    answerForms: Props["answerForms"];
    times: Props["times"];
    buttonSets: Props["buttonSets"];
    functions: Props["functions"];
};

const buttonSetsList: LegacyButtonSets = [
    "basic",
    "trig",
    "prealgebra",
    "scientific",
    "logarithms",
    "basic relations",
    "advanced relations",
];

const parseAnswerKey = ({key}: AnswerForm): number => {
    // We don't throw here because there is data stored in some
    // exercises/articles where the answer forms don't have a key. If we throw,
    // it blocks content editors from loading the page at all.
    // TODO(Jeremy): find a way to handle these answer forms that are missing
    // keys more gracefully.
    return Number.parseInt(key ?? "");
};

// Pick a key that isn't currently used by an answer in answerForms
const _makeNewKey = (answerForms: ReadonlyArray<AnswerForm>) => {
    // first note all the currently used keys in an array, used like a map :3
    // note that this automatically updates the array's length property to
    // be one past the largest key.
    const usedKeys: Array<boolean> = [];
    answerForms.forEach((ans) => {
        usedKeys[parseAnswerKey(ans)] = true;
    });

    // then scan through the array to find the first unused (undefined) key
    for (let i = 0; i < usedKeys.length; i++) {
        if (!usedKeys[i]) {
            return i;
        }
    }

    // if we didn't find a key, make one bigger than all the other keys,
    // since that's how the length property is defined to work on arrays
    return usedKeys.length;
};

type State = {
    // this is to help the "functions" input feel natural
    // while still allowing us to to store the functions as an array
    functionsInternal: string;
};

class ExpressionEditor extends React.Component<Props, State> {
    static widgetName = "expression" as const;

    static defaultProps: DefaultProps = {
        answerForms: [],
        times: false,
        buttonSets: ["basic"],
        functions: ["f", "g", "h"],
    };

    constructor(props) {
        super(props);
        this.state = {
            functionsInternal: this.props.functions.join(" "),
        };
    }

    change(...args) {
        return Changeable.change.apply(this, args);
    }

    serialize: () => any = () => {
        const formSerializables = [
            "value",
            "form",
            "simplify",
            "considered",
            // it's a little weird to serialize the react key, but saves some
            // effort reconstructing them when this item is loaded later.
            "key",
        ];
        const serializables = [
            "answerForms",
            "buttonSets",
            "functions",
            "times",
            "visibleLabel",
            "ariaLabel",
        ];

        const answerForms = this.props.answerForms.map((form) => {
            return _(form).pick(formSerializables);
        });

        return lens(this.props)
            .set(["answerForms"], answerForms)
            .mod([], (props) => _(props).pick(serializables))
            .freeze();
    };

    getSaveWarnings: () => any = () => {
        const issues: Array<any | string> = [];

        if (this.props.answerForms.length === 0) {
            issues.push("No answers specified");
        } else {
            const hasCorrect = this.props.answerForms.some((form) => {
                return form.considered === "correct";
            });
            if (!hasCorrect) {
                issues.push("No correct answer specified");
            }

            _(this.props.answerForms).each((form, ix) => {
                if (this.props.value === "") {
                    issues.push(`Answer ${ix + 1} is empty`);
                } else {
                    // note we're not using icu for content creators
                    const expression = KAS.parse(form.value, {
                        functions: this.props.functions,
                    });
                    if (!expression.parsed) {
                        issues.push(`Couldn't parse ${form.value}`);
                    } else if (
                        form.simplify &&
                        !expression.expr.isSimplified()
                    ) {
                        issues.push(
                            `${form.value} isn't simplified, but is required" +
                            " to be`,
                        );
                    }
                }
            });

            // TODO(joel) - warn about:
            //   - unreachable answers (how??)
            //   - specific answers following unspecific answers
            //   - incorrect answers as the final form
        }

        return issues;
    };

    _newEmptyAnswerForm: () => any = () => {
        return {
            considered: "correct",
            form: false,

            // note: the key means "n-th form created" - not "form in
            // position n" and will stay the same for the life of this form
            key: _makeNewKey(this.props.answerForms),

            simplify: false,
            value: "",
        };
    };

    newAnswer: () => void = () => {
        const answerForms = this.props.answerForms.slice();
        answerForms.push(this._newEmptyAnswerForm());
        this.change({answerForms});
    };

    handleRemoveForm: (answerKey: number) => void = (i) => {
        const answerForms = this.props.answerForms.slice();
        answerForms.splice(i, 1);
        this.change({answerForms});
    };

    // called when the options (including the expression itself) to an answer
    // form change
    updateForm: (i: number, props: any) => void = (i, props) => {
        const answerForms = lens(this.props.answerForms)
            .merge([i], props)
            .freeze();

        this.change({answerForms});
    };

    handleReorder: (components: any) => void = (components) => {
        const answerForms = components.map((component) => {
            const form = _(component.props).pick(
                "considered",
                "form",
                "simplify",
                "value",
            );
            // @ts-expect-error - TS2339 - Property 'key' does not exist on type 'Pick<any, "form" | "value" | "simplify" | "considered">'.
            form.key = component.key;
            return form;
        });

        this.change({answerForms});
    };

    // called when the selected buttonset changes
    handleButtonSet: (changingName: string) => void = (changingName) => {
        const buttonSetNames = buttonSetsList;

        // Filter to preserve order - using .union and .difference would always
        // move the last added button set to the end.
        const buttonSets = buttonSetNames.filter((set) => {
            return (
                this.props.buttonSets.includes(set) !== (set === changingName)
            );
        });

        this.props.onChange({buttonSets});
    };

    handleToggleDiv: () => void = () => {
        // We always want buttonSets to contain exactly one of "basic" and
        // "basic+div". Toggle between the two of them.
        // If someone can think of a more elegant formulation of this (there
        // must be one!) feel free to change it.
        let keep: LegacyButtonSet | undefined;
        let remove: LegacyButtonSet | undefined;
        if (this.props.buttonSets.includes("basic+div")) {
            keep = "basic";
            remove = "basic+div";
        } else {
            keep = "basic+div";
            remove = "basic";
        }

        const buttonSets = this.props.buttonSets
            .filter((set) => set !== remove)
            .concat(keep);

        this.change("buttonSets", buttonSets);
    };

    // called when the correct answer changes
    handleTexInsert: (arg1: string) => void = (str) => {
        // eslint-disable-next-line react/no-string-refs
        // @ts-expect-error - TS2339 - Property 'insert' does not exist on type 'ReactInstance'.
        this.refs.expression.insert(str);
    };

    // called when the function variables change
    handleFunctions: (value: string) => void = (value) => {
        this.setState({functionsInternal: value});
        const newProps: Record<string, any> = {};
        newProps.functions = value.split(/[ ,]+/).filter(isTruthy);
        this.props.onChange(newProps);
    };

    render(): React.ReactNode {
        const answerOptions = this.props.answerForms
            .map((ans: AnswerForm) => {
                const key = parseAnswerKey(ans);

                const expressionProps = {
                    // note we're using
                    // *this.props*.{times,functions,buttonSets} since each
                    // answer area has the same settings for those
                    times: this.props.times,
                    functions: this.props.functions,
                    buttonSets: this.props.buttonSets,

                    buttonsVisible: "focused",
                    form: ans.form,
                    simplify: ans.simplify,
                    value: ans.value,

                    onChange: (props) => this.updateForm(key, props),
                    trackInteraction: () => {},

                    widgetId: this.props.widgetId + "-" + ans.key,
                } as const;

                return lens(ans)
                    .merge([], {
                        key,
                        draggable: true,
                        onChange: (props) =>
                            this.updateForm(
                                Number.parseInt(ans.key ?? ""),
                                props,
                            ),
                        onDelete: () => this.handleRemoveForm(key),
                        expressionProps: expressionProps,
                    })
                    .freeze();
            })
            .map((obj) => <AnswerOption key={obj.key} {...obj} />);

        const sortable = (
            <SortableArea
                components={answerOptions}
                onReorder={this.handleReorder}
            />
        );

        // checkboxes to choose which sets of input buttons are shown
        const buttonSetChoices = buttonSetsList.map((name) => {
            // The first one gets special cased to always be checked, disabled,
            // and float left.
            const isBasic = name === "basic";
            const checked = this.props.buttonSets.includes(name) || isBasic;
            return (
                <Checkbox
                    key={name}
                    label={name}
                    checked={checked}
                    disabled={isBasic}
                    onChange={() => this.handleButtonSet(name)}
                />
            );
        });

        buttonSetChoices.unshift(
            <Checkbox
                key="show ÷ button"
                label="show ÷ button"
                checked={this.props.buttonSets.includes("basic+div")}
                onChange={this.handleToggleDiv}
            />,
        );

        return (
            <div>
                <HeadingSmall>Global Options</HeadingSmall>

                <div className={css(styles.paddedY)}>
                    <LabeledTextField
                        label="Visible label"
                        value={this.props.visibleLabel || ""}
                        onChange={this.change("visibleLabel")}
                    />
                    <InfoTip>
                        <p>
                            Optional visible text; strongly encouraged to help
                            learners using dictation software, but can be
                            omitted if the surrounding content provides enough
                            context.
                        </p>
                    </InfoTip>
                </div>

                <div className={css(styles.paddedY)}>
                    <LabeledTextField
                        label="Aria label"
                        value={this.props.ariaLabel || ""}
                        onChange={this.change("ariaLabel")}
                    />
                    <InfoTip>
                        <p>
                            Label text that's read by screen readers. Highly
                            recommend adding a label here to ensure your
                            exercise is accessible. For more information on
                            writting accessible labels, please see{" "}
                            <a
                                href="https://www.w3.org/WAI/tips/designing/#ensure-that-form-elements-include-clearly-associated-labels"
                                target="_blank"
                            >
                                this article.
                            </a>
                        </p>
                    </InfoTip>
                </div>

                <div className={css(styles.paddedY)}>
                    <LabeledTextField
                        label="Function variables"
                        value={this.state.functionsInternal}
                        onChange={this.handleFunctions}
                    />
                    <InfoTip>
                        <p>
                            Single-letter variables listed here will be
                            interpreted as functions. This let us know that f(x)
                            means "f of x" and not "f times x".
                        </p>
                    </InfoTip>
                </div>

                <div className={css(styles.paddedY)}>
                    <Checkbox
                        label="Use × instead of ⋅ for multiplication"
                        checked={this.props.times}
                        onChange={(value) => {
                            this.props.onChange({times: value});
                        }}
                    />
                    <InfoTip>
                        <p>
                            For pre-algebra problems this option displays
                            multiplication as \times instead of \cdot in both
                            the rendered output and the acceptable formats
                            examples.
                        </p>
                    </InfoTip>
                </div>

                <div className={css(styles.paddedY)}>
                    <HeadingXSmall>Button Sets</HeadingXSmall>
                    {buttonSetChoices}
                </div>

                <HeadingSmall>Answers</HeadingSmall>

                <p style={{margin: "4px 0"}}>
                    student responses area matched against these from top to
                    bottom
                </p>

                {sortable}

                <div>
                    <Button size="small" onClick={this.newAnswer}>
                        Add new answer
                    </Button>
                </div>
            </div>
        );
    }
}

// Find the next element in arr after val, wrapping around to the first.
const findNextIn = function (arr: ReadonlyArray<string>, val: any) {
    let ix = arr.indexOf(val);
    ix = (ix + 1) % arr.length;
    return arr[ix];
};

type AnswerOptionProps = {
    considered: (typeof PerseusExpressionAnswerFormConsidered)[number];
    expressionProps: any;

    // Must the answer have the same form as this answer.
    form: boolean;

    // Must the answer be simplified.
    simplify: boolean;

    onDelete: () => void;
} & Changeable.ChangeableProps;

type AnswerOptionState = {
    deleteFocused: boolean;
};

class AnswerOption extends React.Component<
    AnswerOptionProps,
    AnswerOptionState
> {
    state = {deleteFocused: false};

    change = (...args) => {
        return Changeable.change.apply(this, args);
    };

    handleImSure = () => {
        this.props.onDelete();
    };

    handleCancelDelete = () => {
        this.setState({deleteFocused: false});
    };

    handleDelete = () => {
        this.setState({deleteFocused: true});
    };

    toggleConsidered = () => {
        const newVal = findNextIn(
            PerseusExpressionAnswerFormConsidered,
            this.props.considered,
        );
        this.change({considered: newVal});
    };

    render(): React.ReactNode {
        const removeButton = this.state.deleteFocused ? (
            <>
                <Button
                    size="small"
                    onClick={this.handleImSure}
                    color="destructive"
                >
                    I'm sure!
                </Button>
                <Strut size={spacing.small_12} />
                <Button size="small" onClick={this.handleCancelDelete} light>
                    Cancel
                </Button>
            </>
        ) : (
            <Button
                size="small"
                onClick={this.handleDelete}
                color="destructive"
                light
            >
                Delete
            </Button>
        );

        const answerStatusCss = css(
            styles.answerStatus,
            this.props.considered === "wrong" && styles.answerStatusWrong,
            this.props.considered === "correct" && styles.answerStatusCorrect,
            this.props.considered === "ungraded" && styles.answerStatusUngraded,
        );

        return (
            <div className={css(styles.answerOption)}>
                <div className={css(styles.answerHandle)} />

                <div className={css(styles.answerBody)}>
                    <div>
                        <button
                            onClick={this.toggleConsidered}
                            className={answerStatusCss}
                        >
                            {this.props.considered}
                        </button>

                        <div>
                            <Expression {...this.props.expressionProps} />
                        </div>
                    </div>

                    <div className={css(styles.paddedY, styles.paddedX)}>
                        <Checkbox
                            label="Answer expression must have the same form."
                            checked={this.props.form}
                            onChange={(value) => {
                                this.props.onChange({form: value});
                            }}
                        />
                        <InfoTip>
                            <p>
                                The student's answer must be in the same form.
                                Commutativity and excess negative signs are
                                ignored.
                            </p>
                        </InfoTip>
                    </div>

                    <div className={css(styles.paddedY, styles.paddedX)}>
                        <Checkbox
                            label="Answer expression must be fully expanded and simplified."
                            checked={this.props.simplify}
                            onChange={(value) => {
                                this.props.onChange({simplify: value});
                            }}
                        />
                        <InfoTip>
                            <p>
                                The student's answer must be fully expanded and
                                simplified. Answering this equation (x^2+2x+1)
                                with this factored equation (x+1)^2 will render
                                this response "Your answer is not fully expanded
                                and simplified."
                            </p>
                        </InfoTip>
                    </div>

                    <div className={css(styles.buttonRow, styles.paddedY)}>
                        {removeButton}
                    </div>
                </div>
            </div>
        );
    }
}

export default ExpressionEditor;

const styles = StyleSheet.create({
    paddedX: {
        paddingLeft: spacing.xSmall_8,
        paddingRight: spacing.xSmall_8,
    },
    paddedY: {
        paddingTop: spacing.xxSmall_6,
        paddingBottom: spacing.xxSmall_6,
    },
    answerOption: {
        border: "1px solid #ddd",
        borderRadius: "3px",
        display: "flex",
    },
    answerHandle: {
        // textured draggy handle
        background:
            "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==) no-repeat 50% 50%",
        borderRight: "1px solid #ddd",
        cursor: "move",
        width: "20px",
        minWidth: "20px",
    },
    answerStatus: {
        border: "none",
        userSelect: "none",
        width: "100px",
        paddingTop: spacing.small_12,
        paddingBottom: spacing.small_12,
    },
    answerStatusWrong: {
        backgroundColor: color.fadedRed16,
    },
    answerStatusCorrect: {
        backgroundColor: color.fadedGreen16,
    },
    answerStatusUngraded: {
        backgroundColor: color.fadedBlue16,
    },
    answerBody: {},
    buttonRow: {
        display: "flex",
    },
});
