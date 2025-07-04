import {generateTestPerseusItem} from "@khanacademy/perseus-core";

import {ServerItemRendererWithDebugUI} from "../../../../../testing/server-item-renderer-with-debug-ui";

import {dotPlotter, question1, simple} from "./plotter.testdata";

import type {Meta, StoryObj} from "@storybook/react-vite";

const meta: Meta = {
    title: "Perseus/Widgets/Plotter",
    component: ServerItemRendererWithDebugUI,
};
export default meta;

type Story = StoryObj<typeof ServerItemRendererWithDebugUI>;

export const Basic: Story = {
    args: {
        item: generateTestPerseusItem({question: question1}),
    },
};

export const AnswerlessPlotter: Story = {
    args: {
        item: generateTestPerseusItem({question: question1}),
        startAnswerless: true,
    },
};

export const SimplePlotter: Story = {
    args: {
        item: generateTestPerseusItem({question: simple}),
        startAnswerless: true,
    },
};

export const DotPlotter: Story = {
    args: {
        item: generateTestPerseusItem({question: dotPlotter}),
        startAnswerless: true,
    },
};
