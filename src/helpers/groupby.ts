export type Group<T> = {
    key: Partial<T>;
    items: T[];
}

export type GroupBy<K> = {
    keys: (keyof K)[];
}

export const groupBy = <T extends Record<string, unknown>>(array: T[], grouping: GroupBy<T>): Group<T>[] => {
    const keys = grouping.keys;
    if (array.length > 0 && !keys.every(key => key in array[0])) {
        throw new Error('One of the grouping.keys was not found in one of the elements in the array.');
    }
    
    const groupMap = new Map<string, Group<T>>();
    
    for (const item of array) {
        const keyValues = keys.map(key => `${String(key)}\u001f${String(item[key])}`).join('\u001e');
        const itemCopy = { ...item };
        
        // Check if we already have this group
        if (groupMap.has(keyValues)) {
            groupMap.get(keyValues)!.items.push(itemCopy);
        } else {
            // Extract the key values
            const keyObj = keys.reduce((obj, key) => {
                obj[key] = item[key];
                return obj;
            }, {} as Partial<T>);
            
            // Create a new group
            groupMap.set(keyValues, {
                key: keyObj,
                items: [itemCopy]
            });
        }
    }
    return Array.from(groupMap.values());
};