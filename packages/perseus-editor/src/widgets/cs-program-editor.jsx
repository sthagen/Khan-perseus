/* eslint-disable no-useless-escape, static-service/require-fixture */
// @flow
/**
 * This editor is for embedding Khan Academy CS programs.
 */

import {
    components,
    Changeable,
    Dependencies,
    EditorJsonify,
    Errors,
    Log,
} from "@khanacademy/perseus";
import $ from "jquery";
import PropTypes from "prop-types";
import * as React from "react";
import _ from "underscore";

import RequestInfo from "../../data-access/request-info.js";
import BlurInput from "../components/blur-input.jsx";

const {InfoTip, PropCheckBox} = components;

const DEFAULT_WIDTH = 400;
const DEFAULT_HEIGHT = 400;

/**
 * This is used for editing a name/value pair.
 */
class PairEditor extends React.Component<$FlowFixMe> {
    static propTypes = {
        ...Changeable.propTypes,
        name: PropTypes.string,
        value: PropTypes.string,
    };

    static defaultProps = {
        name: "",
        value: "",
    };

    change = (...args) => {
        return Changeable.change.apply(this, args);
    };

    serialize = () => {
        return EditorJsonify.serialize.call(this);
    };

    render(): React.Node {
        return (
            <fieldset className="pair-editor">
                <label>
                    Name:{" "}
                    <BlurInput
                        value={this.props.name}
                        // $FlowFixMe[incompatible-type] single-param call returns a callback
                        onChange={this.change("name")}
                    />
                </label>
                <label>
                    {" "}
                    Value:{" "}
                    <BlurInput
                        value={this.props.value}
                        // $FlowFixMe[incompatible-type] single-param call returns a callback
                        onChange={this.change("value")}
                    />
                </label>
            </fieldset>
        );
    }
}

/**
 * This is used for editing a set of name/value pairs.
 */
class PairsEditor extends React.Component<$FlowFixMe> {
    static propTypes = {
        ...Changeable.propTypes,
        pairs: PropTypes.arrayOf(
            PropTypes.shape({
                name: PropTypes.string,
                value: PropTypes.string,
            }),
        ).isRequired,
    };

    change = (...args) => {
        return Changeable.change.apply(this, args);
    };

    handlePairChange = (pairIndex, pair) => {
        // If they're both non empty, add a new one
        const pairs = this.props.pairs.slice();
        pairs[pairIndex] = pair;

        const lastPair = pairs[pairs.length - 1];
        if (lastPair.name && lastPair.value) {
            pairs.push({name: "", value: ""});
        }
        this.change("pairs", pairs);
    };

    serialize = () => {
        return EditorJsonify.serialize.call(this);
    };

    render(): React.Node {
        const editors = _.map(this.props.pairs, (pair, i) => {
            return (
                <PairEditor
                    key={i}
                    name={pair.name}
                    value={pair.value}
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange={this.handlePairChange.bind(this, i)}
                />
            );
        });
        return <div>{editors}</div>;
    }
}

const KA_PROGRAM_URL = /khanacademy\.org\/computer-programming\/[^\/]+\/(\d+)/;

/**
 * Given a program URL from the site, extract its program ID.
 * If the input does not match the known URL patterns, it is assumed to be
 * a program ID.
 */
function isolateProgramID(programUrl) {
    const match = KA_PROGRAM_URL.exec(programUrl);
    if (match) {
        programUrl = match[1];
    }

    return programUrl;
}

/**
 * This is the main editor for this widget, to specify all the options.
 */
class CSProgramEditor extends React.Component<$FlowFixMe> {
    static propTypes = {
        ...Changeable.propTypes,
    };

    static widgetName: string = "cs-program";

    static defaultProps: $FlowFixMe = {
        programID: "",
        programType: null,
        settings: [{name: "", value: ""}],
        showEditor: false,
        showButtons: false,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
    };

    change: (...args: $ReadOnlyArray<mixed>) => $FlowFixMe = (...args) => {
        // $FlowFixMe[incompatible-call]
        return Changeable.change.apply(this, args);
    };

    _handleSettingsChange: ($FlowFixMe) => void = (settings) => {
        this.change({settings: settings.pairs});
    };

    _handleProgramIDChange: (string) => void = (programID) => {
        programID = isolateProgramID(programID);
        const {InitialRequestUrl} = Dependencies.getDependencies();

        const host = RequestInfo.IS_DEV_SERVER
            ? InitialRequestUrl.origin
            : // eslint-disable-next-line static-service/require-safe-link-to
              "https://www.khanacademy.org";
        const baseUrl = `${host}/api/internal/scratchpads/${programID}`;

        $.getJSON(baseUrl)
            .done((programInfo) => {
                const programType = programInfo.userAuthoredContentType;
                this.change({
                    width: programInfo.width,
                    height: programInfo.height,
                    programID: programID,
                    programType: programType,
                });
            })
            .fail((jqxhr, textStatus, error) => {
                Log.error(
                    "Error retrieving scratchpad info for program ID ",
                    Errors.TransientService,
                    {
                        cause: error,
                        loggedMetadata: {
                            textStatus,
                            programID,
                        },
                    },
                );
                this.change({
                    width: DEFAULT_WIDTH,
                    height: DEFAULT_HEIGHT,
                    programID: programID,
                    programType: null,
                });
            });
    };

    serialize: () => $FlowFixMe = () => {
        return EditorJsonify.serialize.call(this);
    };

    render(): React.Node {
        return (
            <div>
                <label>
                    Url or Program ID:{" "}
                    <BlurInput
                        value={this.props.programID}
                        onChange={this._handleProgramIDChange}
                    />
                </label>
                <br />
                <PropCheckBox
                    label="Show Editor"
                    showEditor={this.props.showEditor}
                    onChange={this.props.onChange}
                />
                <InfoTip>
                    If you show the editor, you should use the "full-width"
                    alignment to make room for the width of the editor.
                </InfoTip>
                <br />
                <PropCheckBox
                    label="Show Buttons"
                    showButtons={this.props.showButtons}
                    onChange={this.props.onChange}
                />
                <br />
                <label>
                    Settings:
                    <PairsEditor
                        name="settings"
                        pairs={this.props.settings}
                        onChange={this._handleSettingsChange}
                    />
                    <InfoTip>
                        Settings that you add here are available to the program
                        as an object returned by <code>Program.settings()</code>
                    </InfoTip>
                </label>
            </div>
        );
    }
}

export default CSProgramEditor;
