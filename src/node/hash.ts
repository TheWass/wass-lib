import * as crypto from 'node:crypto';
import { convertToString } from '../helpers/log.js';

export const hashRow = <T extends Record<string, unknown>>(row: T, keys?: Array<string>): string => {
    if (!keys) {
        keys = Object.keys(row);
    }
    const keyString = keys.reduce((acc, key) => {
        const cur = convertToString(row[key]);
        return acc + '\x1F' + cur;
    }, '');
    return hashString(keyString);
};

export const hashString = (str: string): string => {
    return crypto.createHash('sha1').update(str).digest('base64');
};