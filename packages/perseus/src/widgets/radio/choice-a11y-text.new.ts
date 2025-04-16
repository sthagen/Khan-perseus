import type {PerseusStrings} from "../../strings";

/**
 * This function is used to generate the a11y text for the radio widget.
 * It is used in the radio-component.tsx file to generate the a11y text for the radio widget.
 *
 * This function is a duplicate of the getA11yText function in choice-a11y-text.ts
 * for the Radio Revitalization Project. (LEMS-2933)
 *
 * This function will eventually replace choice-a11y-text.ts when the feature flag is no longer needed.
 *
 * TODO(LEMS-2994): Clean up this file.
 */
function getA11yText(
    letter: string,
    checked: boolean,
    correct: boolean,
    crossedOut: boolean,
    showCorrectness: boolean,
    strings: PerseusStrings,
): string {
    // There are two pieces of metadata we want to add to each a11yText:
    // whether the answer was checked/crossed-out/neither, and whether the
    // answer is correct/incorrect/not-yet-revealed.
    //
    // Translation is tricky for cross-product situations like this, so
    // we've just enumerated all 9 possibilities as separate strings.
    if (showCorrectness && correct) {
        if (checked) {
            return strings.choiceCheckedCorrect({
                letter,
            });
        }
        if (crossedOut) {
            return strings.choiceCrossedOutCorrect({
                letter,
            });
        }
        return strings.choiceCorrect({
            letter,
        });
    }
    if (showCorrectness && !correct) {
        if (checked) {
            return strings.choiceCheckedIncorrect({
                letter,
            });
        }
        if (crossedOut) {
            return strings.choiceCrossedOutIncorrect({
                letter,
            });
        }
        return strings.choiceIncorrect({
            letter,
        });
    }
    if (checked) {
        return strings.choiceChecked({
            letter,
        });
    }
    if (crossedOut) {
        return strings.choiceCrossedOut({
            letter,
        });
    }
    return strings.choice({
        letter,
    });
}

export default getA11yText;
