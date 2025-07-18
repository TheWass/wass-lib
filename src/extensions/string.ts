export {};
declare global {
    interface String {
        /** This capitalizes the first letter in the string. */
        capitalizeFirstLetter(): string;
        /** This performs a natural compare by padding the numbers in each string with 0s. */
        naturalCompare(other: string, locales?: string | string[], options?: Intl.CollatorOptions): number;
    }
}

if (!String.prototype.capitalizeFirstLetter) {
    String.prototype.capitalizeFirstLetter = function (this: string) {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };
}

if (!String.prototype.naturalCompare) {
    String.prototype.naturalCompare = function (this: string, other: string, locales?: string | string[], options: Intl.CollatorOptions = {}): number {
        options.numeric = true;
        options.sensitivity = options.sensitivity || 'base';
        return new Intl.Collator(locales, options).compare(this, other);
    };
}
