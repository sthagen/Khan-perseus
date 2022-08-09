/* eslint-disable @babel/no-invalid-this */
// @flow
/**
 * Changeable
 *
 * Adds a this.change() function to a component
 *
 * This.change takes prop changes as parameters, and calls
 * this.props.onChange with the modified props.
 */

import PropTypes from "prop-types";
import _ from "underscore";

import {Errors} from "../logging/log.js";
import {PerseusError} from "../perseus-error.js";

import WIDGET_PROP_BLACKLIST from "./widget-prop-blacklist.js";

import type {ChangeFn} from "../types.js";

const USAGE =
    "Usage:\n" +
    "  this.change({propName: 5}, callback);\n" +
    '  this.change("propName", 5, callback);\n' +
    '  this.change("propName")';

/**
 * Primary helper function for this.change()
 *
 * Takes the parameters in a consistent style, once this.change() has
 * figured out which way it was called.
 */
const _changeMultiple = function (component, newProps, callback) {
    // Omit "default" props:
    // ref and key come from react, and don't actually represent
    //   the conceptual state of our component
    // onChange comes from our parent to allow this modification,
    //   and doesn't conceptually represent the state of our component
    const currProps = _.omit(component.props, WIDGET_PROP_BLACKLIST);
    const nextProps = _.extend(currProps, newProps);
    component.props.onChange(nextProps, callback);
};

/**
 * Helper function for changing a single prop
 */
const _changeSingle = function (component, propName: string, value, callback) {
    if (value === undefined) {
        // If called with a single prop name, return a lambda to change
        // a single prop on the current object
        return _.partial(_changeSingle, component, propName);
    }
    // If called with two values, change a single prop of the
    // current object
    const newProps = {};
    newProps[propName] = value;
    _changeMultiple(component, newProps, callback);
};

/**
 * this.change()
 *
 * Can be called as follows:
 * this.change(newProps, callback);
 *
 * this.change(propName, propValue, callback);
 *
 * this.change(propName) -> returns a lambda that takes a prop value to
 * set and a callback to call after having set that value.
 */
// TODO(WEB-1727): use proper flow syntax for overloaded functions
export const change: ChangeFn = function (
    newPropsOrSinglePropName,
    propValue,
    callback,
) {
    if (_.isObject(newPropsOrSinglePropName) && callback === undefined) {
        // Called with an object of multiple props to change
        callback = propValue;
        return _changeMultiple(
            this,
            newPropsOrSinglePropName, // object newProps
            callback,
        );
    }
    if (typeof newPropsOrSinglePropName === "string") {
        // Called with a string propName of a single prop to change
        return _changeSingle(
            this,
            newPropsOrSinglePropName, // string propName
            propValue,
            callback,
        );
    }
    throw new PerseusError(
        "Invalid types sent to this.change(): " +
            _.toArray(arguments).join() +
            "\n" +
            USAGE,
        Errors.Internal,
    );
};

export const propTypes = {
    onChange: PropTypes.func.isRequired,
};

export type ChangeableProps = {|
    onChange: (
        values: {[string]: any, ...},
        callback?: ?() => mixed,
        silent?: boolean,
    ) => mixed,
|};