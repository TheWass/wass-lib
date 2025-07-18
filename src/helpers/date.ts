import { DateTime } from 'luxon';

export const dateIso2Sql = (date: string|undefined|null): string|null => {
    if (!date) return null;
    return DateTime.fromISO(date, { zone: 'utc' }).toSQL({ includeOffset: false });
};

export const date2Sql = (date: string|Date|undefined|null): string|null => {
    if (!date) return null;
    return DateTime.fromJSDate(new Date(date), { zone: 'utc' }).toSQL({ includeOffset: false });
};

export const datesInRange = (startDate: DateTime, endDate: DateTime, month: number, day: number): Array<DateTime> => {
    const dates = [] as Array<DateTime>;
    let testYear = startDate.year;
    while (testYear <= endDate.year) {
        let testDate = DateTime.fromObject({ year: testYear, month, day });
        if (!testDate.isValid) {
            // Handles FYE == 2/29 && test year != a leap year.
            testDate = DateTime.fromObject({ year: testYear, month, day: day - 1 });
        }
        if (startDate < testDate && testDate < endDate) {
            dates.push(testDate);
        }
        testYear++;
    }
    return dates;
};
