import Tooltip from "@khanacademy/wonder-blocks-tooltip";
import {render} from "@testing-library/react";
import * as MafsLibrary from "mafs";
import React from "react";

import * as ReducerGraphConfig from "../../reducer/use-graph-config";

import {StyledMovablePoint} from "./movable-point";

jest.mock("mafs", () => {
    const originalModule = jest.requireActual("mafs");
    return {
        __esModule: true,
        ...originalModule,
        useMovable: jest.fn(),
    };
});

jest.mock("@khanacademy/wonder-blocks-tooltip", () => {
    const originalModule = jest.requireActual(
        "@khanacademy/wonder-blocks-tooltip",
    );
    return {
        __esModule: true,
        ...originalModule,
        default: jest.fn(),
    };
});

const TooltipMock = ({children}) => {
    return children;
};

describe("StyledMovablePoint", () => {
    let useGraphConfigMock: jest.SpyInstance;
    let useMovableMock: jest.SpyInstance;
    const Mafs = MafsLibrary.Mafs;
    const baseGraphConfigContext = {
        snapStep: 1,
        range: [
            [0, 0],
            [1, 1],
        ],
        markings: "graph",
        showTooltips: false,
    };

    beforeEach(() => {
        useGraphConfigMock = jest.spyOn(ReducerGraphConfig, "default");
        useMovableMock = jest
            .spyOn(MafsLibrary, "useMovable")
            .mockReturnValue({dragging: false});
    });

    describe("Tooltip", () => {
        const graphConfigContextWithTooltips = {
            ...baseGraphConfigContext,
            showTooltips: true,
        };

        /*  NOTE: When a WonderBlocks Tooltip is added to an element, it isn't rendered with the element.
                  Instead, it is rendered elsewhere in the document (usually the bottom of the <body>),
                        and only when the user interacts with the element.
                  This makes checking for the Tooltip element difficult to manage in a test.
                  Therefore, these tests mock the Tooltip component and check if/how it is called.
         */
        beforeEach(() => {
            // @ts-expect-error // TS2339: Property mockImplementation does not exist on type typeof Tooltip
            Tooltip.mockImplementation(TooltipMock);
        });

        it("References a tooltip when option is indicated", () => {
            useGraphConfigMock.mockReturnValue(graphConfigContextWithTooltips);
            render(
                <Mafs width={200} height={200}>
                    <StyledMovablePoint point={[0, 0]} onMove={() => {}} />,
                </Mafs>,
            );
            expect(Tooltip).toHaveBeenCalled();
        });

        it("Does NOT reference a tooltip when option is 'false'", () => {
            useGraphConfigMock.mockReturnValue(baseGraphConfigContext);
            render(
                <Mafs width={200} height={200}>
                    <StyledMovablePoint point={[0, 0]} onMove={() => {}} />,
                </Mafs>,
            );
            expect(Tooltip).not.toHaveBeenCalled();
        });

        it("Defaults to a 'blue' background if no color value is provided", () => {
            useGraphConfigMock.mockReturnValue(graphConfigContextWithTooltips);
            render(
                <Mafs width={200} height={200}>
                    <StyledMovablePoint point={[0, 0]} onMove={() => {}} />,
                </Mafs>,
            );
            // @ts-expect-error // TS2339: Property mock does not exist on type typeof Tooltip
            expect(Tooltip.mock.calls[0][0]).toEqual(
                expect.objectContaining({backgroundColor: "blue"}),
            );
        });

        it("Uses the color NAME of the hexadecimal color passed to the point for the background", () => {
            useGraphConfigMock.mockReturnValue(graphConfigContextWithTooltips);
            render(
                <Mafs width={200} height={200}>
                    <StyledMovablePoint
                        point={[0, 0]}
                        color="#9059ff"
                        onMove={() => {}}
                    />
                    ,
                </Mafs>,
            );
            // @ts-expect-error // TS2339: Property mock does not exist on type typeof Tooltip
            expect(Tooltip.mock.calls[0][0]).toEqual(
                expect.objectContaining({backgroundColor: "purple"}),
            );
        });

        it("Defaults to a 'blue' background if the color value provided doesn't match WB colors", () => {
            useGraphConfigMock.mockReturnValue(graphConfigContextWithTooltips);
            render(
                <Mafs width={200} height={200}>
                    <StyledMovablePoint
                        point={[0, 0]}
                        color="#f00"
                        onMove={() => {}}
                    />
                    ,
                </Mafs>,
            );
            // @ts-expect-error // TS2339: Property mock does not exist on type typeof Tooltip
            expect(Tooltip.mock.calls[0][0]).toEqual(
                expect.objectContaining({backgroundColor: "blue"}),
            );
        });
    });

    describe("Hairlines", () => {
        it("Shows hairlines when dragging and 'markings' are NOT set to 'none'", () => {
            useGraphConfigMock.mockReturnValue(baseGraphConfigContext);
            useMovableMock.mockReturnValue({dragging: true});
            const {container} = render(
                <Mafs width={200} height={200}>
                    <StyledMovablePoint point={[0, 0]} onMove={() => {}} />,
                </Mafs>,
            );

            // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
            const svgGroups = container.querySelectorAll("svg > g");
            expect(svgGroups).toHaveLength(2);
            // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
            const hairLines = svgGroups[0].querySelectorAll("line");
            expect(hairLines).toHaveLength(2);
        });

        it("Hairlines do NOT show when not dragging", () => {
            useGraphConfigMock.mockReturnValue(baseGraphConfigContext);
            const {container} = render(
                <Mafs width={200} height={200}>
                    <StyledMovablePoint point={[0, 0]} onMove={() => {}} />,
                </Mafs>,
            );

            // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
            const svgGroups = container.querySelectorAll("svg > g");
            expect(svgGroups).toHaveLength(1);
        });

        it("Hairlines do NOT show when 'markings' are set to 'none'", () => {
            const graphStateContext = {...baseGraphConfigContext};
            graphStateContext.markings = "none";
            useGraphConfigMock.mockReturnValue(graphStateContext);
            useMovableMock.mockReturnValue({dragging: true});
            const {container} = render(
                <Mafs width={200} height={200}>
                    <StyledMovablePoint point={[0, 0]} onMove={() => {}} />,
                </Mafs>,
            );

            // eslint-disable-next-line testing-library/no-container,testing-library/no-node-access
            const svgGroups = container.querySelectorAll("svg > g");
            expect(svgGroups).toHaveLength(1);
        });
    });
});
