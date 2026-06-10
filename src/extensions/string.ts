export {};
declare global {
    interface String {
        /** This capitalizes the first letter in the string. */
        capitalizeFirstLetter(): string;
        /** This performs a natural compare by padding the numbers in each string with 0s. */
        naturalCompare(other: string, locales?: string | string[], options?: Intl.CollatorOptions): number;
    }
}

const defineStringExtension = <K extends keyof String>(key: K, value: String[K]) => {
    if (Object.prototype.hasOwnProperty.call(String.prototype, key)) {
        return;
    }
    Object.defineProperty(String.prototype, key, {
        value,
        writable: true,
        configurable: true,
        enumerable: false
    });
};

export const applyStringExtensions = (): void => {
    defineStringExtension('capitalizeFirstLetter', function (this: string) {
        return this.charAt(0).toUpperCase() + this.slice(1);
    });

    defineStringExtension('naturalCompare', function (this: string, other: string, locales?: string | string[], options: Intl.CollatorOptions = {}): number {
        options.numeric = true;
        options.sensitivity = options.sensitivity || 'base';
        return new Intl.Collator(locales, options).compare(this, other);
    });
};
