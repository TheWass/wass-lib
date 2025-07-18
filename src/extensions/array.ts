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

if (!Array.prototype.asyncForEach) {
    Array.prototype.asyncForEach = async function<T, R> (this: Array<T>, callback: (e: T, i: number, a:Array<T>) => Promise<R>) {
        for (let index = 0; index < this.length; index++) {
            await callback(this[index], index, this);
        }
    };
}

if (!Array.prototype.asyncForAll) {
    Array.prototype.asyncForAll = async function<T, R> (this: Array<T>, callback: (e: T, i: number, a:Array<T>) => Promise<R>) {
        const promises = this.map(callback);
        await Promise.all(promises);
    };
}

if (!Array.prototype.asyncMapEach) {
    Array.prototype.asyncMapEach = async function<T, R> (this: Array<T>, callback: (e: T, i: number, a:Array<T>) => Promise<R>) {
        const res = [];
        for (let index = 0; index < this.length; index++) {
            res.push(await callback(this[index], index, this));
        }
        return res;
    };
}

if (!Array.prototype.asyncMapAll) {
    Array.prototype.asyncMapAll = async function<T, R> (this: Array<T>, callback: (e: T, i: number, a:Array<T>) => Promise<R>) {
        const promises = this.map(callback);
        return await Promise.all(promises);
    };
}

if (!Array.prototype.includesDeep) {
    Array.prototype.includesDeep = function<T> (this: Array<T>, elem: T): boolean {
        const arr = this.map(val => JSON.stringify(val));
        const value = JSON.stringify(elem);
        return arr.includes(value);
    };
}

if (!Array.prototype.flattenDeep) {
    //This is a stack-based flatten.  No need for recursion.
    Array.prototype.flattenDeep = function<T> (this: RecArray<T>): Array<T|undefined> {
        const stack = [...this];
        const res = [];
        while (stack.length) {
            const next = stack.pop();
            if (Array.isArray(next)) {
            // push back array items, won't modify the original input
                stack.push(...next);
            } else {
                res.push(next);
            }
        }
        // reverse to restore input order
        return res.reverse();
    };
}

if (!Array.prototype.distinct) {
    Array.prototype.distinct = function<T> (this: Array<T>, comparator: (a: T, b: T) => boolean = (a, b) => a == b): Array<T> {
        return this.filter((a, index, self) => self.findIndex(b => comparator(a, b)) == index);
    };
}

if (!Array.prototype.removeWhere) {
    Array.prototype.removeWhere = function<T> (this: Array<T>, predicate: (e: T, i: number, a: T[]) => boolean): void {
        // Removing in reverse means we don't need to futz with the index.
        for (let i = this.length - 1; i >= 0; i--) {
            const val = this[i];
            if (predicate(val, i, this)) {
                this.splice(i, 1);
            }
        }
    };
}

if (!Array.prototype.filterNull) {
    Array.prototype.filterNull = function<T> (this: Array<T>): Array<NonNullable<T>> {
        return this.filter((e) => e != null);
    };
}

if (!Array.prototype.splitToGroupsOf) {
    Array.prototype.splitToGroupsOf = function<T> (this: Array<T>, count: number): Array<Array<T>> {
        const groups: Array<Array<T>> = [];
        for (let i = 0; i < this.length; i += count) {
            groups.push(this.slice(i, i + count));
        }
        return groups;
    };
}
