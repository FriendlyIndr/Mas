import { RRule } from 'rrule';

export function detectRepeatPeriod(rruleString) {
    if (!rruleString) return null; // no repetition

    try {
        const rule = RRule.fromString(rruleString);

        switch (rule.options.freq) {
            case RRule.DAILY:
                return 'daily';

            default:
                return null;
        }
    } catch (err) {
        console.error('Invalid RRule:', rruleString);
        return null;
    }
}