import {generateTestPerseusItem} from "@khanacademy/perseus-core";

import {ServerItemRendererWithDebugUI} from "../../../../../testing/server-item-renderer-with-debug-ui";

import {question1} from "./sorter.testdata";

import type {Meta, StoryObj} from "@storybook/react-vite";

const meta: Meta = {
    title: "Perseus/Widgets/Sorter",
    component: ServerItemRendererWithDebugUI,
};
export default meta;

type Story = StoryObj<typeof ServerItemRendererWithDebugUI>;

export const Question1: Story = {
    args: {
        item: generateTestPerseusItem({question: question1}),
    },
};

export const AnswerlessQuestion1: Story = {
    args: {
        item: generateTestPerseusItem({question: question1}),
        startAnswerless: true,
    },
};
