import { assert } from 'chai';
import { DateTime } from 'luxon';
import { describe, it } from 'mocha';
import { convertToString, truncateObject } from './log';

describe('NodeHelpers', () => {
    describe('ConvertToString', () => {
        it('should handle nulls', () => {
            const result1 = convertToString(null);
            assert.strictEqual(result1, 'null');
        });
        it('should handle undefined', () => {
            const result1 = convertToString(undefined);
            assert.strictEqual(result1, 'undefined');
            let test1;
            const result2 = convertToString(test1);
            assert.strictEqual(result2, 'undefined');
        });

        it('should handle true', () => {
            const result1 = convertToString(true);
            assert.strictEqual(result1, '1');
            const result2 = convertToString('true');
            assert.strictEqual(result2, '1');
        });
        it('should handle false', () => {
            const result1 = convertToString(false);
            assert.strictEqual(result1, '0');
            const result2 = convertToString('false');
            assert.strictEqual(result2, '0');
        });

        it('should handle 0', () => {
            const result = convertToString(0);
            assert.strictEqual(result, '0');
        });
        it('should handle empty string', () => {
            const result = convertToString('');
            assert.strictEqual(result, '');
        });

        it('should handle int', () => {
            const result = convertToString(38294);
            assert.strictEqual(result, '38294');
        });
        it('should handle decimals', () => {
            const result = convertToString(423.39);
            assert.strictEqual(result, '423.39');
        });
        it('should handle large stringy numbers', () => {
            const result = convertToString('4620816365158009530');
            assert.strictEqual(result, '4620816365158009530');
        });
        it('should handle decimal stringy numbers', () => {
            const result = convertToString('56.7');
            assert.strictEqual(result, '56.7');
        });
        it('should remove trailing decimal 0s', () => {
            const result = convertToString('4.00');
            assert.strictEqual(result, '4');
        });
        it('should not remove leading 0s (004342)', () => {
            const result = convertToString('004342');
            assert.strictEqual(result, '004342');
        });
        it('should do both (004342.50)', () => {
            const result = convertToString('004342.50');
            assert.strictEqual(result, '004342.5');
        });

        it('should handle dates', () => {
            const result1 = convertToString('2022-01-01');
            assert.strictEqual(result1, '1640995200');
            const result2 = convertToString(new Date(1640995200000));
            assert.strictEqual(result2, '1640995200');
            const result3 = convertToString(DateTime.fromMillis(1640995200000, {zone: 'utc'}));
            assert.strictEqual(result3, '1640995200');
        });

        it('should handle strings', () => {
            const result = convertToString('Hello there!');
            assert.strictEqual(result, 'Hello there!');
        });
        it('should handle objects', () => {
            const result1 = convertToString({ a: 'test', b: 123, c: 12.34 });
            assert.strictEqual(result1, '{"a":"test","b":123,"c":12.34}');
            const result2 = convertToString([33, 34, 35, 36]);
            assert.strictEqual(result2, '33,34,35,36');
            const result3 = convertToString([{a: 1, b: 2, c: 3}, {a: 2, b: 4, c: 6}]);
            assert.strictEqual(result3, '[{"a":1,"b":2,"c":3},{"a":2,"b":4,"c":6}]');
        });
    });
    describe('TruncateObject', () => {
        it('should handle null', () => {
            const test = null;
            const result = truncateObject(test);
            assert.deepEqual(result, test);
        });
        it('should handle undefined', () => {
            const test = undefined;
            const result = truncateObject(test);
            assert.deepEqual(result, test);
        });
        it('should handle flat objects', () => {
            const test = {
                thing: 1,
                stuff: 'junk'
            };
            const result = truncateObject(test);
            assert.deepEqual(result, test);
        });
        it('should handle flat arrays', () => {
            const test = ['stuff', 'things', 1, 'junk', false];
            const result = truncateObject(test);
            assert.deepEqual(result, test);
        });
        it('should handle nested objects', () => {
            const test = {
                thing: 1,
                stuff: 'junk',
                moreStuff: {
                    andThings: 42,
                    andJunk: {
                        moreJunk: 'test'
                    }
                }
            };
            const result = truncateObject(test);
            assert.deepEqual(result, test);
        });
        it('should handle nested arrays', () => {
            const test = ['stuff', ['thing1', 'thing2', null], 1, 'junk', false];
            const result = truncateObject(test);
            assert.deepEqual(result, test);
        });
        it('should handle nested mixed', () => {
            const test = ['stuff', { food: 'tacos', price: 4 }, 1, 'junk', false];
            const result = truncateObject(test);
            assert.deepEqual(result, test);
        });
        it('should handle more nested mixed', () => {
            const test = {
                thing: 1,
                stuff: 'junk',
                food: ['tacos', 'burritos', { taco: 'bell' }]
            };
            const result = truncateObject(test);
            assert.deepEqual(result, test);
        });
        it('should truncate long strings', () => {
            const test = {
                thing: 1,
                longboi: {
                    stuff: 'oFfdUQuvv00WD3Jhcew5KjO9Ag9FWpNhoFfdUQuvv00WD3Jhcew5KjO9Ag9FWpNhoFfdUQuvv00WD3Jhcew5KjO9Ag9FWpNhoFfdUQuvv00WD3Jhcew5KjO9Ag9FWpNhoFfdUQuvv00WD3Jhcew5KjO9Ag9FWpNh'
                }
            };
            const target = {
                thing: 1,
                longboi: {
                    stuff: 'oFfdUQuvv00WD3Jhcew5KjO9A...vv00WD3Jhcew5KjO9Ag9FWpNh'
                }
            };
            const result = truncateObject(test);
            assert.deepEqual(result, target);
        });
        it('should mask forbidden long strings', () => {
            const test = {
                thing: 1,
                longboi: {
                    orgId: 'oFfdUQuvv00WD3Jhcew5KjO9Ag9FWpNhoFfdUQuvv00WD3Jhcew5KjO9Ag9FWpNhoFfdUQuvv00WD3Jhcew5KjO9Ag9FWpNhoFfdUQuvv00WD3Jhcew5KjO9Ag9FWpNhoFfdUQuvv00WD3Jhcew5KjO9Ag9FWpNh'
                }
            };
            const target = {
                thing: 1,
                longboi: {
                    orgId: '********'
                }
            };
            const result = truncateObject(test, true);
            assert.deepEqual(result, target);
        });
        it('should truncate Buffers', () => {
            const test = {
                thing: 1,
                longboi: { data: [48,130,5,77,2,1,1,2,2,3,4,4,2,19,2,4,32,85,121,176,26,36,188,247,58,213,41,46,253,124,184,242,186,28,211,75,231,250,109,190,89,250,235,48,204,18,94,80,211,4,48,97,235,
                    96,244,174,89,199,92,58,119,171,138,87,29,26,176,33,180,79,240,2,234,34,204,112,241,193,85,221,163,97,154,1,121,60,235,55,199,240,195,62,163,49,115,88,122,36,131,161,6,2,4,
                    102,186,19,88,162,4,2,2,28,32,163,130,3,157,48,130,3,153,48,130,3,32,160,3,2,1,2,2,18,4,118,225,204,24,120,36,84,183,15,229,243,57,42,87,85,166,170,48,10,6,8,42,134,72,206,
                    61,4,3,3,48,50,49,11,48,9,6,3,85,4,6,19,2,85,83,49,22,48,20,6,3,85,4,10,19,13,76,101,116,39,115,32,69,110,99,114,121,112,116,49,11,48,9,6,3,85,4,3,19,2,69,53,48,30,23,13,50,
                    52,48,55,49,53,49,56,53,52,50,48,90,23,13,50,52,49,48,49,51,49,56,53,52,49,57,90,48,39,49,37,48,35,6,3,85,4,3,19,28] as Array<unknown>,
                    type: 'Buffer' }
            };
            const target = {
                thing: 1,
                longboi: { data: ['Buffer(259)'], type: 'Buffer' }
            };
            const result = truncateObject(test, true);
            assert.deepEqual(result, target);
        });
        it('should ignore properties preceeded with an underscore.', () => {
            const test = {
                thing: 1,
                longboi: {
                    _ignore: {
                        invisible: 'property'
                    },
                    shown: true
                }
            };
            const target = {
                thing: 1,
                longboi: {
                    shown: true
                }
            };
            const result = truncateObject(test, true);
            assert.isUndefined(result?.longboi._ignore);
            assert.deepEqual(result, target);
        });
    });
});
