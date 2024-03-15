import {View} from "@khanacademy/wonder-blocks-core";
import * as React from "react";

import AssetContext from "../../asset-context";
import {SvgImage} from "../../components";
import {interactiveSizes} from "../../styles/constants";

import type {PerseusImageBackground} from "../../perseus-types";

/**
 * If a graphie URL is provided in `backgroundImage`, will return the rendered graphie background.
 * Otherwise, returns `null`.
 */
export const getLegacyGrid = (
    box: [number, number],
    backgroundImage?: PerseusImageBackground,
) => {
    const {url, width, height} = backgroundImage ?? {};
    if (url && typeof url === "string") {
        const scale = box[0] / interactiveSizes.defaultBoxSize;
        return (
            <View
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                }}
            >
                <AssetContext.Consumer>
                    {({setAssetStatus}) => (
                        <SvgImage
                            src={url}
                            width={width}
                            height={height}
                            scale={scale}
                            responsive={false}
                            setAssetStatus={setAssetStatus}
                            alt=""
                        />
                    )}
                </AssetContext.Consumer>
            </View>
        );
    }
    return null;
};