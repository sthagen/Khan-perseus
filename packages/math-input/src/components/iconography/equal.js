// @flow
/**
 * An autogenerated component that renders the EQUAL iconograpy in SVG.
 *
 * Generated with: convert.js
 */
import * as React from "react";

const Equal = (props: {|color: string|}): React.Node => {
    return (
        <svg width="48" height="48" xmlns:xlink="http://www.w3.org/1999/xlink">
            <defs>
                <path id="a" d="M0 0h600v956H0z" />
            </defs>
            <g fill="none" fill-rule="evenodd">
                <path fill="none" d="M0 0h48v48H0z" />
                <path fill="none" d="M12 12h24v24H12z" />
                <path
                    d="M16 21h17M16 27h17"
                    stroke={props.color}
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <g transform="translate(-434 -518)">
                    <mask id="b" fill="#fff">
                        <use xlinkHref="#a" />
                    </mask>
                    <use fill="#FAFAFA" xlink:href="#a" />
                    <g mask="url(#b)">
                        <path fill="none" d="M434 518h48v48h-48z" />
                        <path fill="none" d="M446 530h24v24h-24z" />
                        <path
                            d="M450 539h17M450 545h17"
                            stroke="#3B3E40"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </g>
                </g>
            </g>
        </svg>
    );
};

export default Equal;
