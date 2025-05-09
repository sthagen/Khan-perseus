import * as PureMarkdown from "@khanacademy/pure-markdown";

import Rule from "../rule";
import TreeTransformer from "../tree-transformer";

import type {MakeRuleOptions} from "../rule";

describe("PerseusLinter lint Rules class", () => {
    const markdown = `
## This Heading is in Title Case

This paragraph contains an unescaped $ sign.

#### This heading skipped a level
`;

    const ruleDescriptions: MakeRuleOptions[] = [
        {
            name: "heading-title-case",
            selector: "heading",
            pattern: /\s[A-Z][a-z]/,
            message: `Title case in heading:
Only capitalize the first word of headings.`,
        },
        {
            name: "unescaped-dollar",
            selector: "unescapedDollar",
            message: `Unescaped '$':
If writing math, pair with another $.
Otherwise escape it by writing \\$.`,
        },
        {
            name: "heading-level-skip",
            selector: "heading ~ heading",
            lint: function (state, content, nodes) {
                const currentHeading = nodes[1];
                const previousHeading = nodes[0];

                expect(nodes).toHaveLength(2);
                expect(nodes[1]).toEqual(state.currentNode());

                // A heading can have a level less than, the same as
                // or one more than the previous heading. But going up
                // by 2 or more levels is not right
                if (currentHeading.level > previousHeading.level + 1) {
                    return `Skipped heading level:
this heading is level ${currentHeading.level} but
the previous heading was level ${previousHeading.level}`;
                }
                return;
            },
        },
    ];

    function parseTree() {
        return PureMarkdown.parse(markdown);
    }

    it("check() method", () => {
        const rules = ruleDescriptions.map((r) => Rule.makeRule(r));
        const tree = parseTree();
        const tt = new TreeTransformer(tree);
        const warnings: Array<
            | any
            | {
                  end: number;
                  message: string;
                  rule: string;
                  severity?: number;
                  start: number;
              }
        > = [];

        tt.traverse((node, state, content) => {
            rules.forEach((r) => {
                const lint = r.check(node, state, content, undefined);
                if (lint) {
                    // TODO(LEMS-3083): Remove eslint suppression
                    // eslint-disable-next-line functional/immutable-data
                    warnings.push(lint);
                }
            });
        });

        expect(warnings).toHaveLength(3);

        expect(warnings[0].rule).toEqual(ruleDescriptions[0].name);
        expect(warnings[0].message).toEqual(ruleDescriptions[0].message);

        expect(warnings[1].rule).toEqual(ruleDescriptions[1].name);
        expect(warnings[1].message).toEqual(ruleDescriptions[1].message);

        expect(warnings[2].rule).toEqual(ruleDescriptions[2].name);
    });
});
