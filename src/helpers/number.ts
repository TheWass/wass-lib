/**
 * Check if the input is a positive float or 0.
 * If it's ANYTHING else (null, undef, "", etc.), return false.
 * @param testValue Any input value (usually string or number)
 * @returns True if the number is a positive float or 0.
 */
export const validatePositiveNumber = function (testValue: unknown): boolean {
    if (testValue == null) return false;
    const num = parseFloat(testValue.toString());
    return !isNaN(num) && isFinite(num) && num >= 0;
};

/** This sums two numbers safely and accurately to a certain precision (default 2) */
export const sumRounded = function (a: number|string, b: number|string, precision = 2): number {
    const factor = Math.pow(10, precision);
    return Math.round((+a * factor) + (+b * factor)) / factor;
};

/** Compares two money values.  Returns true if they're equal or off by one cent. */
export const equalsDisregard1Cent = function (a: number|string, b: number|string): boolean {
    const aInt = Math.round(+a * 100);
    const bInt = Math.round(+b * 100);

    if (aInt == bInt) {
        return true;
    }
    if (aInt + 1 == bInt) {
        return true;
    }
    if (aInt == bInt + 1) {
        return true;
    }
    return false;
};
