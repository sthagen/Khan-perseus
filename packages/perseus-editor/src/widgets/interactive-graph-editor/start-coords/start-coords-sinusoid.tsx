import {View} from "@khanacademy/wonder-blocks-core";
import {Strut} from "@khanacademy/wonder-blocks-layout";
import {color, font, spacing} from "@khanacademy/wonder-blocks-tokens";
import {
    BodyMonospace,
    LabelLarge,
    LabelMedium,
} from "@khanacademy/wonder-blocks-typography";
import {StyleSheet} from "aphrodite";
import * as React from "react";

import CoordinatePairInput from "../../../components/coordinate-pair-input";

import {getSinusoidEquation} from "./util";

import type {Coord} from "@khanacademy/perseus";

type SinusoidCoords = [Coord, Coord];

type Props = {
    startCoords: SinusoidCoords;
    onChange: (startCoords: SinusoidCoords) => void;
};

const StartCoordsSinusoid = (props: Props) => {
    const {startCoords, onChange} = props;

    return (
        <>
            {/* Current equation */}
            <View style={styles.equationSection}>
                <LabelMedium>Starting equation:</LabelMedium>
                <BodyMonospace style={styles.equationBody}>
                    {getSinusoidEquation(startCoords)}
                </BodyMonospace>
            </View>

            {/* Points UI */}
            <View style={styles.tile}>
                <LabelLarge>Point 1:</LabelLarge>
                <Strut size={spacing.small_12} />
                <CoordinatePairInput
                    coord={startCoords[0]}
                    labels={["x", "y"]}
                    onChange={(value) => onChange([value, startCoords[1]])}
                />
            </View>
            <View style={styles.tile}>
                <LabelLarge>Point 2:</LabelLarge>
                <Strut size={spacing.small_12} />
                <CoordinatePairInput
                    coord={startCoords[1]}
                    labels={["x", "y"]}
                    onChange={(value) => onChange([startCoords[0], value])}
                />
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    tile: {
        backgroundColor: color.fadedBlue8,
        marginTop: spacing.xSmall_8,
        padding: spacing.small_12,
        borderRadius: spacing.xSmall_8,
        flexDirection: "row",
        alignItems: "center",
    },
    equationSection: {
        marginTop: spacing.small_12,
    },
    equationBody: {
        backgroundColor: color.fadedOffBlack8,
        border: `1px solid ${color.fadedOffBlack32}`,
        marginTop: spacing.xSmall_8,
        paddingLeft: spacing.xSmall_8,
        paddingRight: spacing.xSmall_8,
        fontSize: font.size.xSmall,
    },
});

export default StartCoordsSinusoid;
