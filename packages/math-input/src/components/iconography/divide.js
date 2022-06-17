// @flow
/**
 * An autogenerated component that renders the DIVIDE iconograpy in SVG.
 *
 * Generated with: convert.js
 */
import * as React from "react";

const Divide = (props: {|color: string|}): React.Node => {
    return (
        <svg width="48" height="48" viewbox="0 0 48 48">
            <defs>
                <path id="a" d="M0 0h600v956H0z" />
            </defs>
            <g fill="none" fillRule="evenodd">
                <g>
                    <path fill="none" d="M0 0h48v48H0z" />
                    <path
                        d="M19 24h10"
                        stroke={props.color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <circle fill="#3B3E40" cx="24" cy="19.5" r="1.5" />
                    <circle fill="#3B3E40" cx="24" cy="28.5" r="1.5" />
                </g>
                <g transform="translate(-50 -450)">
                    <mask id="b" fill="#fff">
                        <use xlinkhref="#a" />
                    </mask>
                    <use fill="#FAFAFA" xlink:href="#a" />
                    <g mask="url(#b)">
                        <g transform="translate(50 450)">
                            <path fill="none" d="M0 0h48v48H0z" />
                            <path
                                d="M19 24h10"
                                stroke="#3B3E40"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <circle fill="#3B3E40" cx="24" cy="19.5" r="1.5" />
                            <circle fill="#3B3E40" cx="24" cy="28.5" r="1.5" />
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    );
};

export default Divide;
