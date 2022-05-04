// @flow
/**
 * An autogenerated component that renders the RADICAL iconograpy in SVG.
 *
 * Generated with: convert.js
 */
import * as React from "react";

const Radical = (props: {|color: string|}): React.Node => {
    return (
        <svg width="48" height="48">
            <defs>
                <path id="a" d="M0 0h600v956H0z" />
            </defs>
            <g fill="none" fillRule="evenodd">
                <path fill="none" d="M0 0h48v48H0z" />
                <path
                    fill={props.color}
                    d="M13 16.997c0-.55.453-.997.997-.997h6.006c.55 0 .997.453.997.997v6.006c0 .55-.453.997-.997.997h-6.006c-.55 0-.997-.453-.997-.997v-6.006ZM15 18h4v4h-4v-4Z"
                />
                <path
                    stroke="#3B3E40"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m14 29 4 6 9-14h7"
                />
                <g transform="translate(-502 -722)">
                    <mask id="b" fill="#fff">
                        <use xlinkhref="#a" />
                    </mask>
                    <use xlink:href="#a" fill="#FAFAFA" />
                    <g mask="url(#b)">
                        <path fill="none" d="M502 722h48v48h-48z" />
                        <path
                            fill="#3B3E40"
                            d="M515 738.997c0-.55.453-.997.997-.997h6.006c.55 0 .997.453.997.997v6.006c0 .55-.453.997-.997.997h-6.006c-.55 0-.997-.453-.997-.997v-6.006Zm2 1.003h4v4h-4v-4Z"
                        />
                        <path
                            stroke="#3B3E40"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m516 751 4 6 9-14h7"
                        />
                    </g>
                </g>
            </g>
        </svg>
    );
};

export default Radical;