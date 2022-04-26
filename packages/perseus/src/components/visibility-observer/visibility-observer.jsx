// @flow
/**
 * This is a wrapper component for the visibility-observer.js utility which
 * abstracts the native or polyfilled IntersectionObserver utility.  The
 * primary purpose of this comonent is to tell you whether the children of
 * the component are visibile within a scrollable ancestor.  It will notify
 * you via an onChange event when the visibility changes, and whether the
 * children are below or above the scroll.
 */
import * as React from "react";
import ReactDOM from "react-dom";

import {getScrollParent} from "./get-scroll-parent.js";
import {createVisibilityObserver} from "./visibility-observer.js";

import type {VisibilityObserver as IVisibilityObserver} from "./visibility-observer.js";

export type ScrollVisibility =
    | "hidden-above"
    | "hidden-below"
    | "visible"
    | "unknown";

type Props = {|
    children: React.Node,
    rootMargin?: string,

    // In most cases, the scroll parent we want to compare against is the body.  Sometimes,
    // there will be a scroll parent which scrolls independant of the body.  In that case,
    // the math is different and we need to be told to find the scroll parent.
    scrollParentIsNotBody?: boolean,

    onChange: (visibility: ScrollVisibility) => void,
|};

function findPositionInScrollContainer(
    childNode: HTMLElement,
    bounds: DOMRectReadOnly,
    scrollParentIsNotBody: boolean,
): ScrollVisibility {
    try {
        const scrollParent = getScrollParent(childNode);
        if (!scrollParent) {
            return "unknown";
        }

        const parentRect = scrollParent.getBoundingClientRect();
        const childRect = childNode.getBoundingClientRect();

        const isAbove =
            !scrollParentIsNotBody || scrollParent === document.body
                ? childRect.bottom < bounds.top
                : childRect.bottom < parentRect.top;

        return isAbove ? "hidden-above" : "hidden-below";
    } catch (e) {
        return "unknown";
    }
}

class VisibilityObserver extends React.Component<Props> {
    _observer: IVisibilityObserver;
    _node: HTMLElement;

    static defaultProps: {|onChange: () => void|} = {
        onChange: () => {},
    };

    componentDidMount() {
        this._node = ((ReactDOM.findDOMNode(this): any): HTMLElement);

        this.registerVisibilityObserver();
    }

    componentWillUnmount() {
        this.unregisterVisibilityObserver();
    }

    handleVisibilityChange: (
        isVisible: boolean,
        rootBounds: DOMRectReadOnly,
    ) => void = (isVisible: boolean, rootBounds: DOMRectReadOnly) => {
        const {scrollParentIsNotBody, onChange} = this.props;

        if (isVisible) {
            onChange("visible");
        } else {
            const visibility = findPositionInScrollContainer(
                this._node,
                rootBounds,
                !!scrollParentIsNotBody,
            );
            onChange(visibility);
        }
    };

    registerVisibilityObserver() {
        const {rootMargin} = this.props;
        if (!this._node) {
            return;
        }

        this._observer = createVisibilityObserver(
            null,
            this.handleVisibilityChange,
            rootMargin,
        );

        this._observer.setTargetElement(this._node);
    }

    unregisterVisibilityObserver() {
        if (this._observer) {
            this._observer.disconnect();
        }
    }

    render(): React.Node {
        return this.props.children;
    }
}

export default VisibilityObserver;
