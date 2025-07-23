export type Group<T> = {
    key: Partial<T>;
    items: T[];
}

export type GroupBy<K> = {
    keys: (keyof K)[];
}

export const groupBy = <T extends Record<string, unknown>>(array: T[], grouping: GroupBy<T>): Group<T>[] => {
    const keys = grouping.keys;
    if (array.length > 0 && !keys.every(key => key in array[0])) throw 'One of the grouping.keys was not found in one of the elements in the array.';
    const groups = array.reduce((groups, item) => {
        const group = groups.find((g: Group<T>) => keys.every(key => item[key] === g.key[key]));
        const itemCopy = Object.getOwnPropertyNames(item).reduce((o, key) => ({ ...o, [key]: item[key] }), {} as T);
        return group ?
            groups.map((g: Group<T>) => (g === group ? { key: g.key, items: [...g.items, itemCopy] } : g)) :
            [
                ...groups,
                {
                    key: keys.reduce((o, key) => ({ ...o, [key]: item[key] }), {} as Partial<T>),
                    items: [itemCopy]
                }
            ];
    }, [] as Group<T>[]);
    return groups;
};