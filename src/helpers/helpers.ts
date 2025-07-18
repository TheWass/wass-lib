export type primitive = string | number | boolean | bigint | null | undefined | symbol;

/**
 * Combines multiple regexes together into one, preserving the flags.
 * @param regexes
 * @returns combined regex.
 */
export const combineRegex = function (...regexes: Array<RegExp>): RegExp {
    const flags = regexes.map(rx => rx.flags).sort().join('').replace(/(.)(?=.*\1)/g, '');
    return RegExp(regexes.map(rx => rx.source).join(''), flags);
};

/**
 * This creates a V4 UUID using the current time as a seed.
 * @returns UUID string
 */
export const createUUID = function (): string {
    let dt = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
};

/**
 * Gets the key of a particular enum value as a string.
 * Null if the value is not a part of the enum.
 * @param enumType Enum's type
 * @param value Enum's value
 * @returns Returns the key based on the type and value.
 */
export const enumToString = function (enumType: Record<string, unknown>, value: unknown): string|null {
    for (const k in enumType) {
        if (enumType[k] == value) {
            return k;
        }
    }
    return null;
};

export const uniqueName = function (name: string, nameExists: (name:string) => boolean): string {
    let newName = name;
    while (nameExists(newName)) {
        if ((newName.match(/\(\d+\)$/)?.length ?? 0) > 0) {
            newName = newName.replace(/\(\d+\)$/, (str) => {
                const n = str.match(/\d+/)![0];
                return '(' + (+n + 1) + ')';
            });
        } else {
            newName += ' (1)';
        }
    }
    return newName;
};
