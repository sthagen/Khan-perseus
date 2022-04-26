// @flow
/**
 * Paragraph parsing/splitting for article jipt i18n
 */

import SimpleMarkdown from "simple-markdown";

const arrayRules = {
    fence: {
        match: SimpleMarkdown.defaultRules.fence.match,
        order: 1,
        parse: (capture, state, parse) => capture[3],
    },
    paragraph: {
        match: SimpleMarkdown.defaultRules.paragraph.match,
        order: 2,
        parse: (capture, state, parse) => capture[1],
    },
};

const builtArrayParser = SimpleMarkdown.parserFor(arrayRules);

// This should just return an array of strings! magick!
const parseToArray = (source: string): $FlowFixMe => {
    // Remove any leading newlines to avoid splitting weirdness
    // (simple-markdown has the `newline` rule for this, and i have
    // no idea how this will handle leading newlines without that rule),
    // and add \n\n to let it parse at a block/paragraph level
    const paragraphedSource = source.replace(/^\n\s*\n/, "") + "\n\n";
    return builtArrayParser(paragraphedSource, {inline: false});
};

const joinFromArray = (paragraphs: $ReadOnlyArray<string>): string =>
    paragraphs.join("\n\n");

export default {
    parseToArray: parseToArray,
    joinFromArray: joinFromArray,
};
