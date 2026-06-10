export {};
declare global {
    type RecArray<T> = Array<RecArray<T> | T>;
    interface Array<T> {
        /** This processes the callback while awaiting for each element in series */
        asyncForEach(callback: (e: T, i: number, a: Array<T>) => Promise<void>): Promise<void>;
        /** This processes the callback on each element in parallel, and returns a promise indicating all are done, or one has failed. */
        asyncForAll(callback: (e: T, i: number, a: Array<T>) => Promise<void>): Promise<void>;
        /** This processes the callback while awaiting for each element in series */
        asyncMapEach<R>(callback: (e: T, i: number, a: Array<T>) => Promise<R>): Promise<Array<R>>;
        /** This processes the callback on each element in parallel, and returns a promise indicating all are done, or one has failed. */
        asyncMapAll<R>(callback: (e: T, i: number, a: Array<T>) => Promise<R>): Promise<Array<R>>;
        /** This checks an array of objects by value using JSON serialization. */
        includesDeep(element: T): boolean;
        /** (UNTESTED) This flattens a multi-dimensional array using a stack */
        flattenDeep<R>(): Array<R|undefined>;
        /** This returns a clone of the array with duplicates removed.  Use the comparator for objects. */
        distinct(comparator?: (a: T, b: T) => boolean): Array<T>;
        /** This removes all elements satisfying the predicate.  Like filter, but in place, and faster. */
        removeWhere(predicate: (e: T, i: number, a: Array<T>) => boolean): void
        /** `this.filter((e) => e != null);`, but typed. */
        filterNull(): Array<NonNullable<T>>;
        /** This creates an array of arrays.  Each subarray will have a maximum number provided by the count */
        splitToGroupsOf(count: number): Array<Array<T>>;
    }
}

const defineArrayExtension = <K extends keyof Array<unknown>>(key: K, value: Array<unknown>[K]) => {
    if (Object.prototype.hasOwnProperty.call(Array.prototype, key)) {
        return;
    }
    Object.defineProperty(Array.prototype, key, {
        value,
        writable: true,
        configurable: true,
        enumerable: false
    });
};

export const applyArrayExtensions = (): void => {
    defineArrayExtension('asyncForEach', async function<T, R> (this: Array<T>, callback: (e: T, i: number, a: Array<T>) => Promise<R>) {
        for (let index = 0; index < this.length; index++) {
            await callback(this[index], index, this);
        }
    });

    defineArrayExtension('asyncForAll', async function<T, R> (this: Array<T>, callback: (e: T, i: number, a: Array<T>) => Promise<R>) {
        const promises = this.map(callback);
        await Promise.all(promises);
    });

    defineArrayExtension('asyncMapEach', async function<T, R> (this: Array<T>, callback: (e: T, i: number, a: Array<T>) => Promise<R>) {
        const res = [];
        for (let index = 0; index < this.length; index++) {
            res.push(await callback(this[index], index, this));
        }
        return res;
    });

    defineArrayExtension('asyncMapAll', async function<T, R> (this: Array<T>, callback: (e: T, i: number, a: Array<T>) => Promise<R>) {
        const promises = this.map(callback);
        return await Promise.all(promises);
    });

    defineArrayExtension('includesDeep', function<T> (this: Array<T>, elem: T): boolean {
        const arr = this.map(val => JSON.stringify(val));
        const value = JSON.stringify(elem);
        return arr.includes(value);
    });

    // This is a stack-based flatten. No recursion needed.
    defineArrayExtension('flattenDeep', function<T> (this: RecArray<T>): Array<T | undefined> {
        const stack = [...this];
        const res = [];
        while (stack.length) {
            const next = stack.pop();
            if (Array.isArray(next)) {
                // Push back array items without mutating input.
                stack.push(...next);
            } else {
                res.push(next);
            }
        }
        // Reverse to restore input order.
        return res.reverse();
    });

    defineArrayExtension('distinct', function<T> (this: Array<T>, comparator: (a: T, b: T) => boolean = (a, b) => a == b): Array<T> {
        return this.filter((a, index, self) => self.findIndex(b => comparator(a, b)) == index);
    });

    defineArrayExtension('removeWhere', function<T> (this: Array<T>, predicate: (e: T, i: number, a: T[]) => boolean): void {
        // Removing in reverse means we don't need to futz with the index.
        for (let i = this.length - 1; i >= 0; i--) {
            const val = this[i];
            if (predicate(val, i, this)) {
                this.splice(i, 1);
            }
        }
    });

    defineArrayExtension('filterNull', function<T> (this: Array<T>): Array<NonNullable<T>> {
        return this.filter((e) => e != null);
    });

    defineArrayExtension('splitToGroupsOf', function<T> (this: Array<T>, count: number): Array<Array<T>> {
        const groups: Array<Array<T>> = [];
        for (let i = 0; i < this.length; i += count) {
            groups.push(this.slice(i, i + count));
        }
        return groups;
    });
};
