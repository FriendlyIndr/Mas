export function createRecurrenceRuleString(repeatPeriod) {
    switch (repeatPeriod) {
        case 'daily':
            return 'FREQ=DAILY;INTERVAL=1';

        default: 
            throw new Error('Unknown repeat period');
    }
}