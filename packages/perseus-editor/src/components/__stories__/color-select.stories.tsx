import * as React from "react";

import ColorSelect from "../../widgets/interactive-graph-editor/locked-figures/color-select";
import {getDefaultFigureForType} from "../../widgets/interactive-graph-editor/locked-figures/util";

import type {LockedFigureColor} from "@khanacademy/perseus";
import type {Meta} from "@storybook/react";

export default {
    title: "PerseusEditor/Components/Color Select",
    component: ColorSelect,
} as Meta<typeof ColorSelect>;

export const Default = (args): React.ReactElement => {
    return <ColorSelect {...args} />;
};

const defaultColor = getDefaultFigureForType("point").color;

// Set the default values in the control panel.
Default.args = {
    id: "color-select",
    selectedValue: defaultColor,
    onChange: () => {},
};

export const Controlled = {
    render: function Render() {
        const [selectedValue, setSelectedValue] =
            React.useState<LockedFigureColor>(defaultColor);

        const handleColorChange = (color: LockedFigureColor) => {
            setSelectedValue(color);
        };

        return (
            <ColorSelect
                selectedValue={selectedValue}
                // TODO(LEMS-2656): remove TS suppression
                onChange={handleColorChange as any}
            />
        );
    },
};
