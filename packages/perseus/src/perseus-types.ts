/**
 * The Perseus "data schema" file.
 *
 * This file, and the types in it, represents the "data schema" that Perseus
 * uses. The @khanacademy/perseus-editor package edits and produces objects
 * that conform to the types in this file. Similarly, the top-level renderers
 * in @khanacademy/perseus, consume objects that conform to these types.
 *
 * WARNING: This file should not import any types from elsewhere so that it is
 * easy to reason about changes that alter the Perseus schema. This helps
 * ensure that it is not changed accidentally when upgrading a dependant
 * package or other part of Perseus code. Note that TypeScript does type
 * checking via something called "structural typing". This means that as long
 * as the shape of a type matches, the name it goes by doesn't matter. As a
 * result, a `Coord` type that looks like this `[x: number, y: number]` is
 * _identical_, in TypeScript's eyes, to this `Vector2` type `[x: number, y:
 * number]`. Also, with tuples, the labels for each entry is ignored, so `[x:
 * number, y: number]` is compatible with `[min: number, max: number]`. The
 * labels are for humans, not TypeScript. :)
 *
 * If you make changes to types in this file, be very sure that:
 *
 *   a) the changes are backwards compatible. If they are not, old data from
 *      previous versions of the "schema" could become unrenderable, or worse,
 *      introduce hard-to-diagnose bugs.
 *   b) the parsing code (`util/parse-perseus-json/`) is updated to handle
 *      the new format _as well as_ the old format.
 */

// TODO(FEI-4010): Remove `Perseus` prefix for all types here

export type Coord = [x: number, y: number];
export type Interval = [min: number, max: number];
export type Vector2 = Coord; // Same name as Mafs
export type Range = Interval;
export type Size = [width: number, height: number];
export type CollinearTuple = [Vector2, Vector2];
export type ShowSolutions = "all" | "selected" | "none";

/**
 * A utility type that constructs a widget map from a "registry interface".
 * The keys of the registry should be the widget type (aka, "categorizer" or
 * "radio", etc) and the value should be the option type stored in the value
 * of the map.
 *
 * You can think of this as a type that generates another type. We use
 * "registry interfaces" as a way to keep a set of widget types to their data
 * type in several places in Perseus. This type then allows us to generate a
 * map type that maps a widget id to its data type and keep strong typing by
 * widget id.
 *
 * For example, given a fictitious registry such as this:
 *
 * ```
 * interface DummyRegistry {
 *     categorizer: { categories: ReadonlyArray<string> };
 *     dropdown: { choices: ReadonlyArray<string> }:
 * }
 * ```
 *
 * If we create a DummyMap using this helper:
 *
 * ```
 * type DummyMap = MakeWidgetMap<DummyRegistry>;
 * ```
 *
 * We'll get a map that looks like this:
 *
 * ```
 * type DummyMap = {
 *     `categorizer ${number}`: { categories: ReadonlyArray<string> };
 *     `dropdown ${number}`: { choices: ReadonlyArray<string> };
 * }
 * ```
 *
 * We use interfaces for the registries so that they can be extended in cases
 * where the consuming app brings along their own widgets. Interfaces in
 * TypeScript are always open (ie. you can extend them) whereas types aren't.
 */
export type MakeWidgetMap<TRegistry> = {
    [Property in keyof TRegistry as `${Property & string} ${number}`]: TRegistry[Property];
};

/**
 * Our core set of Perseus widgets.
 *
 * This interface is the basis for "registering" all Perseus widget types.
 * There should be one key/value pair for each supported widget. If you create
 * a new widget, an entry should be added to this interface. Note that this
 * only registers the widget options type, you'll also need to register the
 * widget so that it's available at runtime (@see
 * {@link file://./widgets.ts#registerWidget}).
 *
 * Importantly, the key should be the name that is used in widget IDs. For most
 * widgets that is the same as the widget option's `type` field. In cases where
 * a widget has been deprecated and replaced with the deprecated-standin
 * widget, it should be the original widget type!
 *
 * If you define the widget outside of this package, you can still add the new
 * widget to this interface by writing the following in that package that
 * contains the widget. TypeScript will merge that definition of the
 * `PerseusWidgets` with the one defined below.
 *
 * ```typescript
 * declare module "@khanacademy/perseus" {
 *     interface PerseusWidgetTypes {
 *         // A new widget
 *         "new-awesomeness": MyAwesomeNewWidget;
 *
 *         // A deprecated widget
 *         "super-old-widget": AutoCorrectWidget;
 *     }
 * }
 *
 * // The new widget's options definition
 * type MyAwesomeNewWidget = WidgetOptions<'new-awesomeness', MyAwesomeNewWidgetOptions>;
 *
 * // The deprecated widget's options definition
 * type SuperOldWidget = WidgetOptions<'super-old-widget', object>;
 * ```
 *
 * This interface can be extended through the magic of TypeScript "Declaration
 * merging". Specifically, we augment this module and extend this interface.
 *
 * @see {@link https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation}
 */
export interface PerseusWidgetTypes {
    categorizer: CategorizerWidget;
    "cs-program": CSProgramWidget;
    definition: DefinitionWidget;
    dropdown: DropdownWidget;
    explanation: ExplanationWidget;
    expression: ExpressionWidget;
    grapher: GrapherWidget;
    "graded-group-set": GradedGroupSetWidget;
    "graded-group": GradedGroupWidget;
    group: GroupWidget;
    iframe: IFrameWidget;
    image: ImageWidget;
    "input-number": InputNumberWidget;
    interaction: InteractionWidget;
    "interactive-graph": InteractiveGraphWidget;
    "label-image": LabelImageWidget;
    matcher: MatcherWidget;
    matrix: MatrixWidget;
    measurer: MeasurerWidget;
    "molecule-renderer": MoleculeRendererWidget;
    "number-line": NumberLineWidget;
    "numeric-input": NumericInputWidget;
    orderer: OrdererWidget;
    "passage-ref-target": RefTargetWidget;
    "passage-ref": PassageRefWidget;
    passage: PassageWidget;
    "phet-simulation": PhetSimulationWidget;
    "python-program": PythonProgramWidget;
    plotter: PlotterWidget;
    radio: RadioWidget;
    sorter: SorterWidget;
    table: TableWidget;
    video: VideoWidget;

    // Deprecated widgets
    "lights-puzzle": AutoCorrectWidget;
    sequence: AutoCorrectWidget;
}

/**
 * A map of widget IDs to widget options. This is most often used as the type
 * for a set of widgets defined in a `PerseusItem` but can also be useful to
 * represent a function parameter where only `widgets` from a `PerseusItem` are
 * needed. Today Widget IDs are made up of the widget type and an incrementing
 * integer (eg. `interactive-graph 1` or `radio 3`). It is suggested to avoid
 * reading/parsing the widget id to derive any information from it, except in
 * the case of this map.
 *
 * @see {@link PerseusWidgetTypes} additional widgets can be added to this map type
 * by augmenting the PerseusWidgetTypes with new widget types!
 */
export type PerseusWidgetsMap = MakeWidgetMap<PerseusWidgetTypes>;

/**
 * A "PerseusItem" is a classic Perseus item. It is rendered by the
 * `ServerItemRenderer` and the layout is pre-set.
 *
 * To render more complex Perseus items, see the `Item` type in the multi item
 * area.
 */
export type PerseusItem = {
    // The details of the question being asked to the user.
    question: PerseusRenderer;
    // A collection of hints to be offered to the user that support answering the question.
    hints: ReadonlyArray<Hint>;
    // Details about the tools the user might need to answer the question
    answerArea: PerseusAnswerArea | null | undefined;
    /**
     * The version of the item.
     * @deprecated Not used.
     */
    itemDataVersion: any;
    /**
     * @deprecated Superseded by per-widget answers.
     */
    answer: any;
};

/**
 * A "PerseusArticle" is an item that is meant to be rendered as an article.
 * This item is never scored and is rendered by the `ArticleRenderer`.
 */
export type PerseusArticle = PerseusRenderer | ReadonlyArray<PerseusRenderer>;

export type Version = {
    // The major part of the version
    major: number;
    // The minor part of the version
    minor: number;
};

export type PerseusRenderer = {
    /**
     * Translatable Markdown content to be rendered.  May include references to
     * widgets (as [[☃ widgetName]]) or images (as ![image text](imageUrl)).
     * For each image found in this content, there can be an entry in the
     * `images` dict (below) with the key being the image's url which defines
     * additional attributes for the image.
     */
    content: string;
    /**
     * A dictionary of {[widgetName]: Widget} to be referenced from the content
     * field.
     */
    widgets: PerseusWidgetsMap;
    // Used in the PerseusGradedGroup widget.  A list of "tags" that are keys
    // that represent other content in the system.  Not rendered to the user.
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    metadata?: ReadonlyArray<string>;
    /**
     * A dictionary of {[imageUrl]: PerseusImageDetail}.
     */
    images: {
        [imageUrl: string]: PerseusImageDetail;
    };
};

export type Hint = PerseusRenderer & {
    /**
     * When `true`, causes the previous hint to be replaced with this hint when
     * displayed. When `false`, the previous hint remains visible when this one
     * is displayed. This allows for hints that build upon each other.
     */
    replace?: boolean;
};

export type PerseusImageDetail = {
    // The width of the image
    width: number;
    // the height of the image
    height: number;
};

export const ItemExtras = [
    // The user might benefit from using a Scientific Calculator.  Provided on Khan Academy when true
    "calculator",
    // The user might benefit from using a statistics Chi Squared Table like https://people.richland.edu/james/lecture/m170/tbl-chi.html
    "chi2Table",
    // The user might benefit from a monthly payments calculator.  Provided on Khan Academy when true
    "financialCalculatorMonthlyPayment",
    // The user might benefit from a total amount calculator.  Provided on Khan Academy when true
    "financialCalculatorTotalAmount",
    // The user might benefit from a time to pay off calculator.  Provided on Khan Academy when true
    "financialCalculatorTimeToPayOff",
    // The user might benefit from using a Periodic Table of Elements.  Provided on Khan Academy when true
    "periodicTable",
    // The user might benefit from using a Periodic Table of Elements with key.  Provided on Khan Academy when true
    "periodicTableWithKey",
    // The user might benefit from using a statistics T Table like https://www.statisticshowto.com/tables/t-distribution-table/
    "tTable",
    // The user might benefit from using a statistics Z Table like https://www.ztable.net/
    "zTable",
] as const;
export type PerseusAnswerArea = Record<(typeof ItemExtras)[number], boolean>;

/**
 * The type representing the common structure of all widget's options. The
 * `Options` generic type represents the widget-specific option data.
 */
export type WidgetOptions<Type extends string, Options> = {
    // The "type" of widget which will define what the Options field looks like
    type: Type;
    // Whether this widget is displayed with the values and is immutable.  For display only
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    static?: boolean;
    // Whether a widget is scored.  Usually true except for IFrame widgets (deprecated)
    // Default: true
    graded?: boolean;
    // The HTML alignment of the widget.  "default" or "block"
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    alignment?: string;
    // Options specific to the type field of the widget.  See Perseus*WidgetOptions for more details
    options: Options;
    // Only used by interactive child widgets (line, point, etc) to identify the components
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    key?: number;
    // The version of the widget data spec.  Used to differentiate between newer and older content data.
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    version?: Version;
};

// prettier-ignore
export type CategorizerWidget = WidgetOptions<'categorizer', PerseusCategorizerWidgetOptions>;
// prettier-ignore
export type CSProgramWidget = WidgetOptions<'cs-program', PerseusCSProgramWidgetOptions>;
// prettier-ignore
export type DefinitionWidget = WidgetOptions<'definition', PerseusDefinitionWidgetOptions>;
// prettier-ignore
export type DropdownWidget = WidgetOptions<'dropdown', PerseusDropdownWidgetOptions>;
// prettier-ignore
export type ExplanationWidget = WidgetOptions<'explanation', PerseusExplanationWidgetOptions>;
// prettier-ignore
export type ExpressionWidget = WidgetOptions<'expression', PerseusExpressionWidgetOptions>;
// prettier-ignore
export type GradedGroupSetWidget = WidgetOptions<'graded-group-set', PerseusGradedGroupSetWidgetOptions>;
// prettier-ignore
export type GradedGroupWidget = WidgetOptions<'graded-group', PerseusGradedGroupWidgetOptions>;
// prettier-ignore
export type GrapherWidget = WidgetOptions<'grapher', PerseusGrapherWidgetOptions>;
// prettier-ignore
export type GroupWidget = WidgetOptions<'group', PerseusGroupWidgetOptions>;
// prettier-ignore
export type IFrameWidget = WidgetOptions<'iframe', PerseusIFrameWidgetOptions>;
// prettier-ignore
export type ImageWidget = WidgetOptions<'image', PerseusImageWidgetOptions>;
// prettier-ignore
export type InteractionWidget = WidgetOptions<'interaction', PerseusInteractionWidgetOptions>;
// prettier-ignore
export type InteractiveGraphWidget = WidgetOptions<'interactive-graph', PerseusInteractiveGraphWidgetOptions>;
// prettier-ignore
export type LabelImageWidget = WidgetOptions<'label-image', PerseusLabelImageWidgetOptions>;
// prettier-ignore
export type MatcherWidget = WidgetOptions<'matcher', PerseusMatcherWidgetOptions>;
// prettier-ignore
export type MatrixWidget = WidgetOptions<'matrix', PerseusMatrixWidgetOptions>;
// prettier-ignore
export type MeasurerWidget = WidgetOptions<'measurer', PerseusMeasurerWidgetOptions>;
// prettier-ignore
export type NumberLineWidget = WidgetOptions<'number-line', PerseusNumberLineWidgetOptions>;
// prettier-ignore
export type NumericInputWidget = WidgetOptions<'numeric-input', PerseusNumericInputWidgetOptions>;
// prettier-ignore
export type OrdererWidget = WidgetOptions<'orderer', PerseusOrdererWidgetOptions>;
// prettier-ignore
export type PassageRefWidget = WidgetOptions<'passage-ref', PerseusPassageRefWidgetOptions>;
// prettier-ignore
export type PassageWidget = WidgetOptions<'passage', PerseusPassageWidgetOptions>;
// prettier-ignore
export type PhetSimulationWidget = WidgetOptions<'phet-simulation', PerseusPhetSimulationWidgetOptions>;
// prettier-ignore
export type PlotterWidget = WidgetOptions<'plotter', PerseusPlotterWidgetOptions>;
// prettier-ignore
export type PythonProgramWidget = WidgetOptions<'python-program', PerseusPythonProgramWidgetOptions>;
// prettier-ignore
export type RadioWidget = WidgetOptions<'radio', PerseusRadioWidgetOptions>;
// prettier-ignore
export type SorterWidget = WidgetOptions<'sorter', PerseusSorterWidgetOptions>;
// prettier-ignore
export type TableWidget = WidgetOptions<'table', PerseusTableWidgetOptions>;
// prettier-ignore
export type InputNumberWidget = WidgetOptions<'input-number', PerseusInputNumberWidgetOptions>;
// prettier-ignore
export type MoleculeRendererWidget = WidgetOptions<'molecule-renderer', PerseusMoleculeRendererWidgetOptions>;
// prettier-ignore
export type RefTargetWidget = WidgetOptions<'passage-ref-target', PerseusPassageRefTargetWidgetOptions>;
// prettier-ignore
export type VideoWidget = WidgetOptions<'video', PerseusVideoWidgetOptions>;
//prettier-ignore
export type AutoCorrectWidget = WidgetOptions<'deprecated-standin', object>;

export type PerseusWidget =
    | CategorizerWidget
    | CSProgramWidget
    | DefinitionWidget
    | DropdownWidget
    | ExplanationWidget
    | ExpressionWidget
    | GradedGroupSetWidget
    | GradedGroupWidget
    | GrapherWidget
    | GroupWidget
    | IFrameWidget
    | ImageWidget
    | InputNumberWidget
    | InteractionWidget
    | InteractiveGraphWidget
    | LabelImageWidget
    | MatcherWidget
    | MatrixWidget
    | MeasurerWidget
    | MoleculeRendererWidget
    | NumberLineWidget
    | NumericInputWidget
    | OrdererWidget
    | PassageRefWidget
    | PassageWidget
    | PhetSimulationWidget
    | PlotterWidget
    | PythonProgramWidget
    | RadioWidget
    | RefTargetWidget
    | SorterWidget
    | TableWidget
    | VideoWidget
    | AutoCorrectWidget;

/**
 * A background image applied to various widgets.
 */
export type PerseusImageBackground = {
    // The URL of the image
    url: string | null | undefined;
    // The width of the image
    width?: number;
    // The height of the image
    height?: number;
    // The top offset of the image
    // NOTE: perseus_data.go says this is required, but nullable, even though
    // it isn't necessary at all.
    top?: number;
    // The left offset of the image
    // NOTE: perseus_data.go says this is required, but nullable, even though
    // it isn't necessary at all.
    left?: number;
    // The scale of the image
    // NOTE: perseus_data.go says this is required, but nullable, even though
    // it isn't necessary at all.
    // Yikes, production data as this as both a number (1) and string ("1")
    scale?: number | string;
    // The bottom offset of the image
    // NOTE: perseus_data.go says this is required, but nullable, even though
    // it isn't necessary at all.
    bottom?: number;
};

export type PerseusCategorizerWidgetOptions = {
    // Translatable text; a list of items to categorize. e.g. ["banana", "yellow", "apple", "purple", "shirt"]
    items: ReadonlyArray<string>;
    // Translatable text; a list of categories. e.g. ["fruits", "colors", "clothing"]
    categories: ReadonlyArray<string>;
    // Whether the items should be randemized
    randomizeItems: boolean;
    // Whether this widget is displayed with the results and immutable
    static: boolean;
    // The correct answers where index relates to the items and value relates to the category.  e.g. [0, 1, 0, 1, 2]
    values: ReadonlyArray<number>;
    // Whether we should highlight i18n linter errors found on this widget
    highlightLint?: boolean;
    // Internal editor configuration. Can be ignored by consumers.
    linterContext?: PerseusLinterContext;
};

export type PerseusLinterContext = {
    contentType: string;
    paths: ReadonlyArray<string>;
    stack: ReadonlyArray<string>;
};

export type PerseusDefinitionWidgetOptions = {
    // Translatable text; the word to define. e.g. "vertex"
    togglePrompt: string;
    // Translatable text; the definition of the word. e.g. "where 2 rays connect"
    definition: string;
    // Always false. Not used for this widget
    static: boolean;
};

export type PerseusDropdownWidgetOptions = {
    // A list of choices for the dropdown
    choices: ReadonlyArray<PerseusDropdownChoice>;
    // Translatable Text; placeholder text for a dropdown. e.g. "Please select a fruit"
    placeholder: string;
    // Always false.  Not used for this widget
    static: boolean;
    // Translatable Text; visible label for the dropdown
    visibleLabel?: string;
    // Translatable Text; aria label that screen readers will read
    ariaLabel?: string;
};

export type PerseusDropdownChoice = {
    // Translatable text; The text for the option. e.g. "Banana" or "Orange"
    content: string;
    // Whether this is the correct option or not
    correct: boolean;
};

export type PerseusExplanationWidgetOptions = {
    // Translatable Text; The clickable text to expand an explanation.  e.g. "What is an apple?"
    showPrompt: string;
    // Translatable Text; The cliclable text to hide an explanation. e.g. "Thanks. I got it!"
    hidePrompt: string;
    // Translatable Markdown; The explanation that is shown when showPrompt is clicked.  e.g. "An apple is a tasty fruit."
    explanation: string;
    // explanation fields can embed widgets. When they do, the details of the widgets are here.
    widgets: PerseusWidgetsMap;
    // Always false.  Not used for this widget
    static: boolean;
};

export type LegacyButtonSets = ReadonlyArray<
    | "basic"
    | "basic+div"
    | "trig"
    | "prealgebra"
    | "logarithms"
    | "basic relations"
    | "advanced relations"
    | "scientific"
>;

export type PerseusExpressionWidgetOptions = {
    // The expression forms the answer may come in
    answerForms: ReadonlyArray<PerseusExpressionAnswerForm>;
    buttonSets: LegacyButtonSets;
    // Variables that can be used as functions.  Default: ["f", "g", "h"]
    functions: ReadonlyArray<string>;
    // Use x for rendering multiplication instead of a center dot.
    times: boolean;
    // visible label associated with the MathQuill field
    visibleLabel?: string;
    // aria label for screen readers attached to MathQuill field
    ariaLabel?: string;
    // Controls when buttons for special characters are visible when using a
    // desktop browser.  Defaults to "focused".
    // NOTE: This isn't listed in perseus-format.js or perseus_data.go, but
    // appears in item data in the datastore.
    buttonsVisible?: "always" | "never" | "focused";
};

export const PerseusExpressionAnswerFormConsidered = [
    "correct",
    "wrong",
    "ungraded",
] as const;

export type PerseusExpressionAnswerForm = {
    // The TeX form of the expression.  e.g. "x\\cdot3=y"
    value: string;
    // The Answer expression must have the same form
    form: boolean;
    // The answer expression must be fully expanded and simplified
    simplify: boolean;
    // Whether the form is considered "correct", "wrong", or "ungraded"
    considered: (typeof PerseusExpressionAnswerFormConsidered)[number];
    // A key to identify the answer form in a list
    // NOTE: perseus-format.js says this is required even though it isn't necessary.
    key?: string;
};

export type PerseusGradedGroupWidgetOptions = {
    // Translatable Text; A title to be displayed for the group.
    title: string;
    // Not used in Perseus (but is set in (en, pt) production data)
    hasHint?: boolean | null | undefined;
    // A section to define hints for the group.
    hint?: PerseusRenderer | null | undefined;
    // Translatable Markdown. May include widgets and images embedded.
    content: string;
    // See PerseusRenderer.widgets
    widgets: PerseusWidgetsMap;
    // Not used in Perseus
    widgetEnabled?: boolean | null | undefined;
    // Not used in Perseus
    immutableWidgets?: boolean | null | undefined;
    // See PerseusRenderer.images
    images: {
        [key: string]: PerseusImageDetail;
    };
};

export type PerseusGradedGroupSetWidgetOptions = {
    // A list of Widget Groups
    gradedGroups: ReadonlyArray<PerseusGradedGroupWidgetOptions>;
};

// 2D range: xMin, xMax, yMin, yMax
export type GraphRange = [
    x: [min: number, max: number],
    y: [min: number, max: number],
];

export type GrapherAnswerTypes =
    | {
          type: "absolute_value";
          coords: [
              // The vertex
              Coord, // A point along one line of the absolute value "V" lines
              Coord,
          ];
      }
    | {
          type: "exponential";
          // Two points along the asymptote line. Usually (always?) a
          // horizontal or vertical line.
          asymptote: [Coord, Coord];
          // Two points along the exponential curve. One end of the curve
          // trends towards the asymptote.
          coords: [Coord, Coord];
      }
    | {
          type: "linear";
          // Two points along the straight line
          coords: [Coord, Coord];
      }
    | {
          type: "logarithm";
          // Two points along the asymptote line.
          asymptote: [Coord, Coord];
          // Two points along the logarithmic curve. One end of the curve
          // trends towards the asymptote.
          coords: [Coord, Coord];
      }
    | {
          type: "quadratic";
          coords: [
              // The vertex of the parabola
              Coord, // A point along the parabola
              Coord,
          ];
      }
    | {
          type: "sinusoid";
          // Two points on the same slope in the sinusoid wave line.
          coords: [Coord, Coord];
      }
    | {
          type: "tangent";
          // Two points on the same slope in the tangent wave line.
          coords: [Coord, Coord];
      };

export type PerseusGrapherWidgetOptions = {
    availableTypes: ReadonlyArray<
        | "absolute_value"
        | "exponential"
        | "linear"
        | "logarithm"
        | "quadratic"
        | "sinusoid"
        | "tangent"
    >;
    correct: GrapherAnswerTypes;
    graph: {
        backgroundImage: {
            bottom?: number;
            height?: number;
            left?: number;
            scale?: number;
            url?: string | null | undefined;
            width?: number;
        };
        box?: [number, number];
        editableSettings?: ReadonlyArray<
            "graph" | "snap" | "image" | "measure"
        >;
        gridStep?: [number, number];
        labels: [string, string];
        markings: "graph" | "none" | "grid";
        range: GraphRange;
        rulerLabel: "";
        rulerTicks: number;
        showProtractor?: boolean;
        showRuler?: boolean;
        showTooltips?: boolean;
        snapStep?: [number, number];
        step: [number, number];
        valid?: boolean | string;
    };
};

export type PerseusGroupWidgetOptions = PerseusRenderer;

export type PerseusImageWidgetOptions = {
    // Translatable Markdown; Text to be shown for the title of the image
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    title?: string;
    // Translatable Markdown; Text to be shown in the caption section of an image
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    caption?: string;
    // Translatable Text; The alt text to be shown in the img.alt attribute
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    alt?: string;
    // The image details for the image to be displayed
    backgroundImage: PerseusImageBackground;
    // Always false.  Not used for this widget
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    static?: boolean;
    // A list of labels to display on the image
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    labels?: ReadonlyArray<PerseusImageLabel>;
    // The range on the image render for labels
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    range?: [Interval, Interval];
    // The box on the image render for labels. The same as backgroundImage.width and backgroundImage.height
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    box?: Size;
};

export type PerseusImageLabel = {
    // Translatable Text; The content of the label to display
    content: string;
    // The visual alignment of the label. default: "center"
    alignment: string;
    // The point on the image to display the label
    coordinates: ReadonlyArray<number>;
};

export type PerseusInteractiveGraphWidgetOptions = {
    // Where the little black axis lines & labels (ticks) should render.
    // Also known as the tick step. default [1, 1]
    // NOTE(kevinb): perseus_data.go defines this as Array<number>
    step: [number, number];
    // Where the grid lines on the graph will render. default [1, 1]
    // NOTE(kevinb): perseus_data.go defines this as Array<number>
    gridStep?: [x: number, y: number];
    // Where the graph points will lock to when they are dragged. default [0.5, 0.5]
    // NOTE(kevinb): perseus_data.go defines this as Array<number>
    snapStep?: [x: number, y: number];
    // An optional image to use in the background
    backgroundImage?: PerseusImageBackground;
    /**
     * The type of markings to display on the graph.
     * - graph: shows the axes and the grid lines
     * - grid: shows only the grid lines
     * - none: shows no markings
     */
    markings: "graph" | "grid" | "none";
    // How to label the X and Y axis.  default: ["x", "y"]
    labels?: ReadonlyArray<string>;
    // Whether to show the Protractor tool overlayed on top of the graph
    showProtractor: boolean;
    /**
     * Whether to show the Ruler tool overlayed on top of the graph.
     * @deprecated - no longer used by the InteractiveGraph widget. The
     * property is kept on this type to prevent its accidental reuse in future
     * features, since it may appear in production data.
     */
    showRuler?: boolean;
    // Whether to show tooltips on the graph
    showTooltips?: boolean;
    /**
     * The unit to show on the ruler.  e.g. "mm", "cm",  "m", "km", "in", "ft",
     * "yd", "mi".
     * @deprecated - no longer used by the InteractiveGraph widget. The
     * property is kept on this type to prevent its accidental reuse in future
     * features, since it may appear in production data.
     */
    rulerLabel?: string;
    /**
     * How many ticks to show on the ruler.  e.g. 1, 2, 4, 8, 10, 16. Must be
     * an integer.
     * @deprecated - no longer used by the InteractiveGraph widget. The
     * property is kept on this type to prevent its accidental reuse in future
     * features, since it may appear in production data.
     */
    rulerTicks?: number;
    // The X and Y coordinate ranges for the view of the graph.  default: [[-10, 10], [-10, 10]]
    // NOTE(kevinb): perseus_data.go defines this as Array<Array<number>>
    // TODO(kevinb): Add a transform function to interactive-graph.jsx to
    // rename `range` to `ranges` so that things are less confusing.
    range: GraphRange;
    // The type of graph
    graph: PerseusGraphType;
    // The correct kind of graph, if being used to select function type
    // TODO(LEMS-2344): make the type of `correct` more specific
    correct: PerseusGraphType;
    // Shapes (points, chords, etc) displayed on the graph that cannot
    // be moved by the user.
    lockedFigures?: ReadonlyArray<LockedFigure>;
    // Aria label that applies to the entire graph.
    fullGraphAriaLabel?: string;
    // Aria description that applies to the entire graph.
    fullGraphAriaDescription?: string;
};

export const lockedFigureColorNames = [
    "blue",
    "green",
    "grayH",
    "purple",
    "pink",
    "orange",
    "red",
] as const;

export type LockedFigureColor = (typeof lockedFigureColorNames)[number];

export const lockedFigureColors: Record<LockedFigureColor, string> = {
    blue: "#3D7586",
    green: "#447A53",
    grayH: "#3B3D45",
    purple: "#594094",
    pink: "#B25071",
    red: "#D92916",
    orange: "#946700",
} as const;

export type LockedFigure =
    | LockedPointType
    | LockedLineType
    | LockedVectorType
    | LockedEllipseType
    | LockedPolygonType
    | LockedFunctionType
    | LockedLabelType;
export type LockedFigureType = LockedFigure["type"];

export type LockedLineStyle = "solid" | "dashed";

export type LockedPointType = {
    type: "point";
    coord: Coord;
    color: LockedFigureColor;
    filled: boolean;
    labels?: LockedLabelType[];
    ariaLabel?: string;
};

export type LockedLineType = {
    type: "line";
    kind: "line" | "ray" | "segment";
    points: [point1: LockedPointType, point2: LockedPointType];
    color: LockedFigureColor;
    lineStyle: LockedLineStyle;
    showPoint1: boolean;
    showPoint2: boolean;
    labels?: LockedLabelType[];
    ariaLabel?: string;
};

export type LockedVectorType = {
    type: "vector";
    points: [tail: Coord, tip: Coord];
    color: LockedFigureColor;
    labels?: LockedLabelType[];
    ariaLabel?: string;
};

export type LockedFigureFillType = "none" | "white" | "translucent" | "solid";
export const lockedFigureFillStyles: Record<LockedFigureFillType, number> = {
    none: 0,
    white: 1,
    translucent: 0.4,
    solid: 1,
} as const;

export type LockedEllipseType = {
    type: "ellipse";
    center: Coord;
    radius: [x: number, y: number];
    angle: number;
    color: LockedFigureColor;
    fillStyle: LockedFigureFillType;
    strokeStyle: LockedLineStyle;
    labels?: LockedLabelType[];
    ariaLabel?: string;
};

export type LockedPolygonType = {
    type: "polygon";
    points: ReadonlyArray<Coord>;
    color: LockedFigureColor;
    showVertices: boolean;
    fillStyle: LockedFigureFillType;
    strokeStyle: LockedLineStyle;
    labels?: LockedLabelType[];
    ariaLabel?: string;
};

export type LockedFunctionType = {
    type: "function";
    color: LockedFigureColor;
    strokeStyle: LockedLineStyle;
    equation: string; // This is the user-defined equation (as it was typed)
    directionalAxis: "x" | "y";
    domain?: Interval;
    labels?: LockedLabelType[];
    ariaLabel?: string;
};

// Not associated with a specific figure
export type LockedLabelType = {
    type: "label";
    coord: Coord;
    // TeX-supported string
    text: string;
    color: LockedFigureColor;
    size: "small" | "medium" | "large";
};

export type PerseusGraphType =
    | PerseusGraphTypeAngle
    | PerseusGraphTypeCircle
    | PerseusGraphTypeLinear
    | PerseusGraphTypeLinearSystem
    | PerseusGraphTypeNone
    | PerseusGraphTypePoint
    | PerseusGraphTypePolygon
    | PerseusGraphTypeQuadratic
    | PerseusGraphTypeRay
    | PerseusGraphTypeSegment
    | PerseusGraphTypeSinusoid;

type PerseusGraphTypeCommon = {
    // NOTE(jeremy): This is referenced in the component. Verify if there's any
    // production data that still has this.
    coord?: Coord; // Legacy!
};

export type PerseusGraphTypeAngle = {
    type: "angle";
    // Whether to show the angle measurements.  default: false
    showAngles?: boolean;
    // Allow Reflex Angles if an "angle" type.  default: true
    allowReflexAngles?: boolean;
    // The angle offset in degrees if an "angle" type. default: 0
    angleOffsetDeg?: number;
    // Snap to degree increments if an "angle" type. default: 1
    snapDegrees?: number;
    // How to match the answer. If missing, defaults to exact matching.
    match?: "congruent";
    // must have 3 coords - ie [Coord, Coord, Coord]
    coords?: [Coord, Coord, Coord] | null;
    // The initial coordinates the graph renders with.
    startCoords?: [Coord, Coord, Coord];
};

export type PerseusGraphTypeCircle = {
    type: "circle";
    center?: Coord;
    radius?: number;
    // The initial coordinates the graph renders with.
    startCoords?: {
        center: Coord;
        radius: number;
    };
} & PerseusGraphTypeCommon;

export type PerseusGraphTypeLinear = {
    type: "linear";
    // expects 2 coords
    coords?: CollinearTuple | null;
    // The initial coordinates the graph renders with.
    startCoords?: CollinearTuple;
} & PerseusGraphTypeCommon;

export type PerseusGraphTypeLinearSystem = {
    type: "linear-system";
    // expects 2 sets of 2 coords
    coords?: CollinearTuple[] | null;
    // The initial coordinates the graph renders with.
    startCoords?: CollinearTuple[];
} & PerseusGraphTypeCommon;

export type PerseusGraphTypeNone = {
    type: "none";
};

export type PerseusGraphTypePoint = {
    type: "point";
    // The number of points if a "point" type.  default: 1.  "unlimited" if no limit
    numPoints?: number | "unlimited";
    coords?: ReadonlyArray<Coord> | null;
    // The initial coordinates the graph renders with.
    startCoords?: ReadonlyArray<Coord>;
} & PerseusGraphTypeCommon;

export type PerseusGraphTypePolygon = {
    type: "polygon";
    // The number of sides.  default: 3. "unlimited" if no limit
    numSides?: number | "unlimited";
    // Whether to the angle measurements.  default: false
    showAngles?: boolean;
    // Whether to show side measurements. default: false
    showSides?: boolean;
    // How to snap points.  e.g. "grid", "angles", or "sides". default: grid
    snapTo?: "grid" | "angles" | "sides";
    // How to match the answer. If missing, defaults to exact matching.
    match?: "similar" | "congruent" | "approx";
    coords?: ReadonlyArray<Coord> | null;
    // The initial coordinates the graph renders with.
    startCoords?: ReadonlyArray<Coord>;
} & PerseusGraphTypeCommon;

export type PerseusGraphTypeQuadratic = {
    type: "quadratic";
    // expects a list of 3 coords
    coords?: [Coord, Coord, Coord] | null;
    // The initial coordinates the graph renders with.
    startCoords?: [Coord, Coord, Coord];
} & PerseusGraphTypeCommon;

export type PerseusGraphTypeSegment = {
    type: "segment";
    // The number of segments if a "segment" type. default: 1.  Max: 6
    numSegments?: number;
    // Expects a list of Coord tuples. Length should match the `numSegments` value.
    coords?: CollinearTuple[] | null;
    // The initial coordinates the graph renders with.
    startCoords?: CollinearTuple[];
} & PerseusGraphTypeCommon;

export type PerseusGraphTypeSinusoid = {
    type: "sinusoid";
    // Expects a list of 2 Coords
    coords?: ReadonlyArray<Coord> | null;
    // The initial coordinates the graph renders with.
    startCoords?: ReadonlyArray<Coord>;
} & PerseusGraphTypeCommon;

export type PerseusGraphTypeRay = {
    type: "ray";
    // Expects a list of 2 Coords
    coords?: CollinearTuple | null;
    // The initial coordinates the graph renders with.
    startCoords?: CollinearTuple;
} & PerseusGraphTypeCommon;

type AngleGraphCorrect = {
    type: "angle";
    allowReflexAngles: boolean;
    match: "congruent";
    coords: [Coord, Coord, Coord];
};

type CircleGraphCorrect = {
    type: "circle";
    center: Coord;
    radius: number;
};

type LinearGraphCorrect = {
    type: "linear";
    coords: CollinearTuple;
};

type LinearSystemGraphCorrect = {
    type: "linear-system";
    coords: [CollinearTuple, CollinearTuple];
};

type NoneGraphCorrect = {
    type: "none";
};

type PointGraphCorrect = {
    type: "point";
    coords: ReadonlyArray<Coord>;
};

type PolygonGraphCorrect = {
    type: "polygon";
    match: "similar" | "congruent" | "approx";
    coords: ReadonlyArray<Coord>;
};

type QuadraticGraphCorrect = {
    type: "quadratic";
    coords: [Coord, Coord, Coord];
};

type SegmentGraphCorrect = {
    type: "segment";
    coords: CollinearTuple[];
};

type SinusoidGraphCorrect = {
    type: "sinusoid";
    coords: CollinearTuple;
};

type RayGraphCorrect = {
    type: "ray";
    coords: CollinearTuple;
};

export type PerseusGraphCorrectType =
    | AngleGraphCorrect
    | CircleGraphCorrect
    | LinearGraphCorrect
    | LinearSystemGraphCorrect
    | NoneGraphCorrect
    | PointGraphCorrect
    | PolygonGraphCorrect
    | QuadraticGraphCorrect
    | RayGraphCorrect
    | SegmentGraphCorrect
    | SinusoidGraphCorrect;

export type PerseusLabelImageWidgetOptions = {
    // Translatable Text; Tex representation of choices
    choices: ReadonlyArray<string>;
    // The URL of the image
    imageUrl: string;
    // Translatable Text; To show up in the img.alt attribute
    imageAlt: string;
    // The height of the image
    imageHeight: number;
    // The width of the image
    imageWidth: number;
    // A list of markers to display on the image
    markers: ReadonlyArray<PerseusLabelImageMarker>;
    // Do not display answer choices in instructions
    hideChoicesFromInstructions: boolean;
    // Allow multiple answers per marker
    multipleAnswers: boolean;
    // Always false.  Not used for this widget
    static: boolean;
};

export type PerseusLabelImageMarker = {
    // A list of correct answers for this marker.  Often only one but can have multiple
    answers: ReadonlyArray<string>;
    // Translatable Text; The text to show for the marker. Not displayed directly to the user
    label: string;
    // X Coordiate location of the marker on the image
    x: number;
    // Y Coordinate location of the marker on the image
    y: number;
};

export type PerseusMatcherWidgetOptions = {
    // Translatable Text; Labels to adorn the headings for the columns.  Only 2 values [left, right]. e.g. ["Concepts", "Things"]
    labels: ReadonlyArray<string>;
    // Translatable Text; Static concepts to show in the left column. e.g. ["Fruit", "Color", "Clothes"]
    left: ReadonlyArray<string>;
    // Translatable Markup; Values that represent the concepts to be correlated with the concepts.  e.g. ["Red", "Shirt", "Banana"]
    right: ReadonlyArray<string>;
    // Order of the matched pairs matters. With this option enabled, only the order provided above will be treated as correct. This is useful when ordering is significant, such as in the context of a proof. If disabled, pairwise matching is sufficient. To make this clear, the left column becomes fixed in the provided order and only the cards in the right column can be moved.
    orderMatters: boolean;
    // Adds padding to the rows.  Padding is good for text, but not needed for images.
    padding: boolean;
};

export type PerseusMatrixWidgetAnswers = ReadonlyArray<ReadonlyArray<number>>;
export type PerseusMatrixWidgetOptions = {
    // Translatable Text; Shown before the matrix
    prefix?: string | undefined;
    // Translatable Text; Shown after the matrix
    suffix?: string | undefined;
    // A data matrix representing the "correct" answers to be entered into the matrix
    answers: PerseusMatrixWidgetAnswers;
    // The coordinate location of the cursor position at start. default: [0, 0]
    cursorPosition?: ReadonlyArray<number> | undefined;
    // The coordinate size of the matrix.  Only supports 2-dimensional matrix.  default: [3, 3]
    matrixBoardSize: ReadonlyArray<number>;
    // Whether this is meant to statically display the answers (true) or be used as an input field, graded against the answers
    static?: boolean | undefined;
};

export type PerseusMeasurerWidgetOptions = {
    // The image that the user is meant to measure
    image: PerseusImageBackground;
    // Whether to show the Protractor tool overlayed on top of the image
    showProtractor: boolean;
    // Whether to show the Ruler tool overlayed on top of the image
    showRuler: boolean;
    // The unit to show on the ruler.  e.g. "mm", "cm",  "m", "km", "in", "ft", "yd", "mi"
    rulerLabel: string;
    // How many ticks to show on the ruler.  e.g. 1, 2, 4, 8, 10, 16
    rulerTicks: number;
    // The number of image pixels per unit (label)
    rulerPixels: number;
    // The number of units to display on the ruler
    rulerLength: number;
    // Containing area [width, height]
    box: [number, number];
    // Always false.  Not used for this widget
    static: boolean;
};

export type MathFormat =
    | "integer"
    | "mixed"
    | "improper"
    | "proper"
    | "decimal"
    | "percent"
    | "pi";

export type PerseusNumericInputAnswerForm = {
    simplify:
        | "required"
        | "correct"
        | "enforced"
        | "optional"
        | null
        | undefined;
    name: MathFormat;
};

export type PerseusNumericInputWidgetOptions = {
    // A list of all the possible correct and incorrect answers
    answers: ReadonlyArray<PerseusNumericInputAnswer>;
    // Translatable Text; Text to describe this input. This will be shown to users using screenreaders.
    labelText?: string | undefined;
    // Use size "Normal" for all text boxes, unless there are multiple text boxes in one line and the answer area is too narrow to fit them. Options: "normal" or "small"
    size: string;
    // A coefficient style number allows the student to use - for -1 and an empty string to mean 1.
    coefficient: boolean;
    // Whether to right-align the text or not
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    rightAlign?: boolean;
    // Always false.  Not used for this widget
    static: boolean;
    // Used by examples, maybe not used and should be removed in the future
    // see TODO in numeric-input
    answerForms?: ReadonlyArray<PerseusNumericInputAnswerForm>;
};

export type PerseusNumericInputAnswer = {
    // Translatable Display; A description for why this answer is correct, wrong, or ungraded
    message: string;
    // The expected answer
    value?: number | null;
    // Whether this answer is "correct", "wrong", or "ungraded"
    status: string;
    // The forms available for this answer.  Options: "integer, ""decimal", "proper", "improper", "mixed", or "pi"
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    answerForms?: ReadonlyArray<MathFormat>;
    // Whether we should check the answer strictly against the the configured answerForms (strict = true)
    // or include the set of default answerForms (strict = false).
    strict: boolean;
    // A range of error +/- the value
    // NOTE: perseus_data.go says this is non-nullable even though we handle null values.
    maxError: number | null | undefined;
    // Unsimplified answers are Ungraded, Accepted, or Wrong. Options: "required", "correct", or "enforced"
    simplify: string | null | undefined;
};

export type PerseusNumberLineWidgetOptions = {
    // The position of the endpoints of the number line. Setting the range constrains the position of the answer and the labels.
    range: ReadonlyArray<number>;
    // This controls the position of the left / right labels. By default, the labels are set by the range.  Note:  Ensure that the labels line up with the tick marks, or it may be confusing for users.
    labelRange: ReadonlyArray<number | null>;
    // This controls the styling of the labels for the two main labels as well as all the tick mark labels, if applicable. Options: "decimal", "improper", "mixed", "non-reduced"
    labelStyle: string;
    // Show label ticks
    labelTicks: boolean;
    // Show tick controller
    isTickCtrl?: boolean | null | undefined;
    // The range of divisions within the line
    divisionRange: ReadonlyArray<number>;
    // This controls the number (and position) of the tick marks. The number of divisions is constrained to the division range. Note:  The user will be able to specify the number of divisions in a number input.
    numDivisions: number | null | undefined;
    // This determines the number of different places the point will snap between two adjacent tick marks. Note: Ensure the required number of snap increments is provided to answer the question.
    snapDivisions: number;
    // This controls the number (and position) of the tick marks; you can either set the number of divisions (2 divisions would split the entire range in two halves), or the tick step (the distance between ticks) and the other value will be updated accordingly. Note:  There is no check to see if labels coordinate with the tick marks, which may be confusing for users if the blue labels and black ticks are off-step.
    tickStep: number | null | undefined;
    // The correct relative value. default: "eq". options: "eq", "lt", "gt", "le", "ge"
    correctRel: string | null | undefined;
    // This is the correct answer. The answer is validated (as right or wrong) by using only the end position of the point and the relation (=, &lt;, &gt;, ≤, ≥).
    correctX: number;
    // This controls the initial position of the point along the number line
    initialX: number | null | undefined;
    // Show tooltips
    showTooltip?: boolean;
    // When true, the answer is displayed and is immutable
    static: boolean;
};

export type PerseusOrdererWidgetOptions = {
    // All of the options available to the user. Place the cards in the correct order. The same card can be used more than once in the answer but will only be displayed once at the top of a stack of identical cards.
    options: ReadonlyArray<PerseusRenderer>;
    // The correct order of the options
    correctOptions: ReadonlyArray<PerseusRenderer>;
    // Cards that are not part of the answer
    otherOptions: ReadonlyArray<PerseusRenderer>;
    // "normal" for text options.  "auto" for image options.
    height: "normal" | "auto";
    // Use the "horizontal" layout for short text and small images. The "vertical" layout is best for longer text (e.g. proofs).
    layout: "horizontal" | "vertical";
};

export type PerseusPassageWidgetOptions = {
    // Translatable Text; To add footnotes, add ^ characters where they belong in the passage. Then, add ^ in the footnotes area to reference the footnotes in the passage.
    footnotes: string;
    // Translatable Text; The text of the passage
    passageText: string;
    // translatableText - An optional title that will appear directly above the passage in the same font style. (e.g. Passage 1)
    passageTitle: string;
    // Should we show line numbers along with the passage?
    showLineNumbers: boolean;
    // Always false.  Not used for this widget
    static: boolean;
};

export type PerseusPassageRefWidgetOptions = {
    // The passage number
    passageNumber: number;
    // The reference number
    referenceNumber: number;
    // Short summary of the referenced section. This will be included in parentheses and quotes automatically.
    summaryText?: string;
};

export const plotterPlotTypes = [
    "bar",
    "line",
    "pic",
    "histogram",
    "dotplot",
] as const;
export type PlotType = (typeof plotterPlotTypes)[number];

export type PerseusPlotterWidgetOptions = {
    // Translatable Text; The Axis labels. e.g. ["X Label", "Y Label"]
    labels: ReadonlyArray<string>;
    // Translatable Text; Categories to display along the X access.  e.g. [">0", ">6", ">12", ">18"]
    categories: ReadonlyArray<string>;
    // The type of the graph. options "bar", "line", "pic", "histogram", "dotplot"
    type: PlotType;
    // The maximimum Y tick to display in the graph
    maxY: number;
    // The scale of the Y Axis
    scaleY: number;
    // Which ticks to display the labels for. For instance, setting this to "4" will only show every 4th label (plus the last one)
    labelInterval: number | null | undefined;
    // Creates the specified number of divisions between the horizontal lines. Fewer snaps between lines makes the graph easier for the student to create correctly.
    snapsPerLine: number;
    // The Y values the graph should start with
    starting: ReadonlyArray<number>;
    // The Y values that represent the correct answer expected
    correct: ReadonlyArray<number>;
    // A picture to represent items in a graph.
    picUrl: string | null | undefined;
    // deprecated
    picSize: number | null | undefined;
    // deprecated
    picBoxHeight: number | null | undefined;
    // deprecated
    plotDimensions: ReadonlyArray<number>;
};

export type PerseusRadioWidgetOptions = {
    // The choices provided to the user.
    choices: ReadonlyArray<PerseusRadioChoice>;
    // Does this have a "none of the above" option?
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    hasNoneOfTheAbove?: boolean;
    // If multipleSelect is enabled, Specify the number expected to be correct.
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    countChoices?: boolean;
    // Randomize the order of the options or keep them as defined
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    randomize?: boolean;
    // Does this set allow for multiple selections to be correct?
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    multipleSelect?: boolean;
    // deprecated
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    deselectEnabled?: boolean;
    // deprecated
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    onePerLine?: boolean;
    // deprecated
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    displayCount?: any;
    // v0 props
    // `noneOfTheAbove` is still in use (but only set to `false`).
    noneOfTheAbove?: false;
};

export type PerseusRadioChoice = {
    // Translatable Markdown; The label for this choice
    content: string;
    // Translatable Markdown; A clue to give the user when they get it wrong
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    clue?: string;
    // Whether this option is a correct answer or not
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    correct?: boolean;
    // If this is none of the above, override the content with "None of the above"
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    isNoneOfTheAbove?: boolean;
    // deprecated
    // NOTE: perseus_data.go says this is required even though it isn't necessary.
    widgets?: PerseusWidgetsMap;
};

export type PerseusSorterWidgetOptions = {
    // Translatable Text; The correct answer (in the correct order). The user will see the cards in a randomized order.
    correct: ReadonlyArray<string>;
    // Adds padding to the options.  Padding is good for text but not needed for images
    padding: boolean;
    // Use the "horizontal" layout for short text and small images. The "vertical" layout is best for longer text and larger images.
    layout: "horizontal" | "vertical";
};

export type PerseusTableWidgetOptions = {
    // Translatable Text; A list of column headers
    headers: ReadonlyArray<string>;
    // The number of rows to display
    rows: number;
    // The number of columns to display
    columns: number;
    // Translatable Text; A 2-dimensional array of text to populate the table with
    answers: ReadonlyArray<ReadonlyArray<string>>;
};

export type PerseusInteractionWidgetOptions = {
    // The definition of the graph
    graph: PerseusInteractionGraph;
    // The elements of the graph
    elements: ReadonlyArray<PerseusInteractionElement>;
    // Always false.  Not used for this widget
    static: boolean;
};

export type PerseusInteractionGraph = {
    // "canvas", "graph"
    editableSettings?: ReadonlyArray<"canvas" | "graph">;
    // The Grid Canvas size. e.g. [400, 140]
    box: Size;
    // The Axis labels.  e.g. ["x", "y"]
    labels: ReadonlyArray<string>;
    // The Axis ranges. e.g. [[-10, 10], [-10, 10]]
    range: [Interval, Interval];
    // The steps in the grid. default [1, 1]
    gridStep: [number, number];
    /**
     * The type of markings to display on the graph.
     * - graph: shows the axes and the grid lines
     * - grid: shows only the grid lines
     * - none: shows no markings
     */
    markings: "graph" | "grid" | "none";
    // The snap steps. default [0.5, 0.5]
    snapStep?: [number, number];
    // Whether the grid is valid or not.  Do the numbers all make sense?
    // NOTE(jeremy) The editor for this widget sometimes stores the graph
    // editor validation error message into this field. It seems innocuous
    // because it looks like many of these usages don't actually use the graph
    // at all.
    valid?: boolean | string;
    // An optional background image to use
    backgroundImage?: PerseusImageBackground;
    // Whether to show the Protractor tool overlayed on top of the graph
    showProtractor?: boolean;
    // Whether to show the Ruler tool overlayed on top of the graph
    showRuler?: boolean;
    // The unit to show on the ruler.  e.g. "mm", "cm",  "m", "km", "in", "ft", "yd", "mi"
    rulerLabel?: string;
    // How many ticks to show on the ruler.  e.g. 1, 2, 4, 8, 10, 16
    rulerTicks?: number;
    // This controls the number (and position) of the tick marks for the X and Y axis. e.g. [1, 1]
    tickStep: [number, number];
};

export type PerseusInteractionElement =
    | {
          type: "function";
          // An identifier for the element
          key: string;
          options: PerseusInteractionFunctionElementOptions;
      }
    | {
          type: "label";
          // An identifier for the element
          key: string;
          options: PerseusInteractionLabelElementOptions;
      }
    | {
          type: "line";
          // An identifier for the element
          key: string;
          options: PerseusInteractionLineElementOptions;
      }
    | {
          type: "movable-line";
          // An identifier for the element
          key: string;
          options: PerseusInteractionMovableLineElementOptions;
      }
    | {
          type: "movable-point";
          // An identifier for the element
          key: string;
          options: PerseusInteractionMovablePointElementOptions;
      }
    | {
          type: "parametric";
          // An identifier for the element
          key: string;
          options: PerseusInteractionParametricElementOptions;
      }
    | {
          type: "point";
          // An identifier for the element
          key: string;
          options: PerseusInteractionPointElementOptions;
      }
    | {
          type: "rectangle";
          // An identifier for the element
          key: string;
          options: PerseusInteractionRectangleElementOptions;
      };

export type PerseusInteractionFunctionElementOptions = {
    // The definition of the function to draw on the graph.  e.g "x^2 + 1"
    value: string;
    // The name of the function like f(n). default: "f"
    funcName: string;
    // The range of points to start plotting
    rangeMin: string;
    // The range of points to end plotting
    rangeMax: string;
    // The color of the stroke. e.g. #6495ED
    color: string;
    // If the function stroke has a dash, what is it? options: "", "-", "- ", ".", ". "
    strokeDasharray: string;
    // The thickness of the stroke
    strokeWidth: number;
};

export type PerseusInteractionLabelElementOptions = {
    // Translatable Text; the content of the label
    label: string;
    // The color of the label.  e.g. "red"
    color: string;
    // The X location of the label
    coordX: string;
    // The Y location of the label
    coordY: string;
};

export type PerseusInteractionLineElementOptions = {
    // A color code for the line segment.  e.g. "#FFOOAF"
    color: string;
    // The start of the line segment (X)
    startX: string;
    // The start of the line segment (Y)
    startY: string;
    // The end of the line segment (X)
    endX: string;
    // The end of the line segment (Y)
    endY: string;
    // If the line stroke has a dash, what is it? options: "", "-", "- ", ".", ". "
    strokeDasharray: string;
    // The thickness of the line
    strokeWidth: number;
    // Does the line have an arrow point to it? options: "", "->"
    arrows: string;
};

export type PerseusInteractionMovableLineElementOptions = {
    // The start of the line segment (X)
    startX: string;
    // The start of the line segment (Y)
    startY: string;
    // Start updates (Xn, Yn) for n
    startSubscript: number;
    // The end of the line segment (X)
    endX: string;
    // The end of the line segment (Y)
    endY: string;
    // End updates (Xm, Ym) for m
    endSubscript: number;
    // How to constrain this line? options "none", "snap", "x", "y"
    constraint: string;
    // The snap resolution when constraint is set to "snap"
    snap: number;
    // The constraint function for when constraint is set to "x" or "y"
    constraintFn: string;
    // The lowest possible X value
    constraintXMin: string;
    // The highest possible X value
    constraintXMax: string;
    // The lowest possible Y value
    constraintYMin: string;
    // The highest possible Y value
    constraintYMax: string;
};

export type PerseusInteractionMovablePointElementOptions = {
    // The X position of the point
    startX: string;
    // The Y position of the point
    startY: string;
    // Update (Xn, Yn) for n
    varSubscript: number;
    // How to constrain this line? options "none", "snap", "x", "y"
    constraint: string;
    // The snap resolution when constraint is set to "snap"
    snap: number;
    // The constraint function for when constraint is set to "x" or "y"
    constraintFn: string;
    // The lowest possible X value
    constraintXMin: string;
    // The highest possible X value
    constraintXMax: string;
    // The lowest possible Y value
    constraintYMin: string;
    // The highest possible Y value
    constraintYMax: string;
};

export type PerseusInteractionParametricElementOptions = {
    // The function for the X coordinate. e.g. "\\cos(t)"
    x: string;
    // The function for the Y coordinate. e.g. "\\sin(t)"
    y: string;
    // The range of points to start plotting
    rangeMin: string;
    // The range of points to end plotting
    rangeMax: string;
    // The color of the stroke. e.g. #6495ED
    color: string;
    // If the function stroke has a dash, what is it? options: "", "-", "- ", ".", ". "
    strokeDasharray: string;
    // The thickness of the stroke
    strokeWidth: number;
};

export type PerseusInteractionPointElementOptions = {
    // The color of the point.  e.g. "black"
    color: string;
    // The X coordinate of the point
    coordX: string;
    // The Y coordinate of the point
    coordY: string;
};

export type PerseusInteractionRectangleElementOptions = {
    // The fill color.  e.g. "#EDD19B"
    color: string;
    // The lower left point X
    coordX: string;
    // The lower left point Y
    coordY: string;
    // The width of the rectangle
    width: string;
    // The height of the rectangle
    height: string;
};

export type PerseusCSProgramWidgetOptions = {
    // The ID of the CS program to embed
    programID: string;
    // Deprecated.  Always null and sometimes omitted entirely.
    programType?: any;
    // Settings that you add here are available to the program as an object returned by Program.settings()
    settings: ReadonlyArray<PerseusCSProgramSetting>;
    // If you show the editor, you should use the "full-width" alignment to make room for the width of the editor.
    showEditor: boolean;
    // Whether to show the execute buttons
    showButtons: boolean;
    // The width of the widget
    width: number;
    // The height of the widget
    height: number;
    // Always false
    static: boolean;
};

export type PerseusCSProgramSetting = {
    // The name/key of the setting
    name: string;
    // The value of the setting
    value: string;
};

export type PerseusPythonProgramWidgetOptions = {
    // The ID of the Python program to embed
    programID: string;
    // The height of the widget in pixels
    height: number;
};

export type PerseusIFrameWidgetOptions = {
    // A URL to display OR a CS Program ID
    url: string;
    // Settings that you add here are available to the program as an object returned by Program.settings()
    settings: ReadonlyArray<PerseusCSProgramSetting>;
    // The width of the widget
    width: number | string;
    // The height of the widget
    height: number | string;
    // Whether to allow the IFrame to become full-screen (like a video)
    allowFullScreen: boolean;
    // Whether to allow the iframe content to redirect the page
    allowTopNavigation?: boolean;
    // Always false
    static: boolean;
};

export type PerseusPhetSimulationWidgetOptions = {
    // A URL to display, must start with https://phet.colorado.edu/
    url: string;
    // Translatable Text; Description of the sim for Khanmigo and alt text
    description: string;
};

export type PerseusVideoWidgetOptions = {
    location: string;
    static?: boolean;
};

export type PerseusInputNumberWidgetOptions = {
    answerType?:
        | "number"
        | "decimal"
        | "integer"
        | "rational"
        | "improper"
        | "mixed"
        | "percent"
        | "pi";
    inexact?: boolean;
    maxError?: number | string;
    rightAlign?: boolean;
    simplify: "required" | "optional" | "enforced";
    size: "normal" | "small";
    value: string | number;
    customKeypad?: boolean;
};

export type PerseusMoleculeRendererWidgetOptions = {
    widgetId: string;
    rotationAngle?: number;
    smiles?: string;
};

export type PerseusPassageRefTargetWidgetOptions = {
    content: string;
};

export type PerseusWidgetOptions =
    | PerseusCategorizerWidgetOptions
    | PerseusCSProgramWidgetOptions
    | PerseusDefinitionWidgetOptions
    | PerseusDropdownWidgetOptions
    | PerseusExplanationWidgetOptions
    | PerseusExpressionWidgetOptions
    | PerseusGradedGroupSetWidgetOptions
    | PerseusGradedGroupWidgetOptions
    | PerseusIFrameWidgetOptions
    | PerseusImageWidgetOptions
    | PerseusInputNumberWidgetOptions
    | PerseusInteractionWidgetOptions
    | PerseusInteractiveGraphWidgetOptions
    | PerseusLabelImageWidgetOptions
    | PerseusMatcherWidgetOptions
    | PerseusMatrixWidgetOptions
    | PerseusMeasurerWidgetOptions
    | PerseusMoleculeRendererWidgetOptions
    | PerseusNumberLineWidgetOptions
    | PerseusNumericInputWidgetOptions
    | PerseusOrdererWidgetOptions
    | PerseusPassageRefTargetWidgetOptions
    | PerseusPassageRefWidgetOptions
    | PerseusPassageWidgetOptions
    | PerseusPhetSimulationWidgetOptions
    | PerseusPlotterWidgetOptions
    | PerseusRadioWidgetOptions
    | PerseusSorterWidgetOptions
    | PerseusTableWidgetOptions
    | PerseusVideoWidgetOptions;
