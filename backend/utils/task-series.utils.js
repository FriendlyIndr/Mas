import pkg from "rrule";
const { RRule } = pkg;

export function validateRRule(rruleString) {
    try {
        const rule = RRule.fromString(rruleString);
        const { freq, interval } = rule.options;

        if ([RRule.SECONDLY, RRule.MINUTELY, RRule.HOURLY].includes(freq)) {
            throw new Error('Unsupported frequency');
        }

        return true;
    } catch (err) {
        return false;
    }
}