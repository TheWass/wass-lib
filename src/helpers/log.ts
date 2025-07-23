import { DateTime } from 'luxon';

export const convertToString = (obj: unknown): string => {
    if (obj === null) {
        return 'null';
    }
    if (obj === undefined) {
        return 'undefined';
    }
    // Objects and Arrays look like this
    if (obj.toString().startsWith('[object Object]')) {
        return JSON.stringify(obj);
    }
    // Javascript Dates
    if (obj instanceof Date) {
        const jsDate = DateTime.fromJSDate(obj, { zone: 'utc' });
        if (jsDate.isValid) {
            return Math.round(jsDate.toSeconds()).toString();
        }
    }
    // String dates
    let str = obj.toString();
    if (str.match(/\d\d\d\d-\d\d-\d\d/)) {
        const sqlDate = DateTime.fromSQL(str, { zone: 'utc' });
        if (sqlDate.isValid) {
            return Math.round(sqlDate.toSeconds()).toString();
        }
        const isoDate = DateTime.fromISO(str, { zone: 'utc' });
        if (isoDate.isValid) {
            return Math.round(isoDate.toSeconds()).toString();
        }
    }
    // Numbers might look like '5.00'.  Convert to '5'
    // Also Javascript likes to round very large (ID-like) numbers when casting from a string. No casting!
    if (!isNaN(+str) && str.indexOf('.') >= 0) {
        return str.replace(/(?<=\..+)0+$|\.0+$/, '');
    }
    // Booleans in the database look like '0' and '1'
    if (str === 'true') {
        str = '1';
    }
    if (str === 'false') {
        str = '0';
    }
    return str;
};

type Entries<T> = { [K in keyof T]-?: [K, T[K]]; }[keyof T][];
const FORBIDDEN_KEYS = ['key', 'id', 'user', 'pass', 'secret'];
export const truncateObject = <T extends object>(obj: T|null|undefined, sanitize = false, level = 0): T|null|undefined => {
    if (level > 5) return null;
    if (obj == null) return obj;
    const processValue = (value: unknown, key: string, lvl: number): unknown => {
        if (value instanceof DateTime) {
            if (value.hour == 0 && value.minute == 0 && value.second == 0 && value.millisecond == 0) {
                return value.toISODate();
            }
        } else if (typeof value == 'object' && value != null) {
            if ('data' in value && Array.isArray(value.data) && 'type' in value && value.type == 'Buffer') {
                value.data = ['Buffer(' + value.data.length + ')'];
            }
            return truncateObject(value, sanitize, lvl + 1);
        } else if (typeof value == 'string') {
            if (sanitize && FORBIDDEN_KEYS.some((test) => key.toLocaleLowerCase().includes(test))) {
                return '********';
            } else if (value.length > 55) {
                return (value.slice(0, 25) + '...' + value.slice(value.length - 25));
            }
        }
        return value;
    }
    if (Array.isArray(obj)) {
        const newArray = [] as Array<unknown>;
        obj.forEach((value, key) => {
            newArray.push(processValue(value, key.toString(), level));
        });
        return newArray as T;
    } else {
        const newObj = {} as T;
        (Object.entries(obj) as Entries<T>).forEach(([key, value]) => {
            if (key.toString().startsWith('_')) return;
            newObj[key] = processValue(value, key.toString(), level) as T[keyof T];
        });
        return newObj as T;
    }
};

export const serializeError = function (error: unknown): string {
    if (typeof error == 'string') {
        return error;
    }
    if (error instanceof Error) {
        const errObj = {
            ...error,
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: ('cause' in error) ? error.cause : undefined,
        };
        return JSON.stringify(errObj);
    }
    return JSON.stringify(error);
};