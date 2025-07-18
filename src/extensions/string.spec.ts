import { assert } from 'chai';
import { describe, it } from 'mocha';
import './string';

describe('StringExtensions', () => {
    describe('NaturalCompare', () => {
        it('should match localeCompare', () => {
            const tests = [
                ['',''],
                ['0', ''],
                ['', '0'],
                ['0', '0'],
                ['a', 'a'],
                ['a', 'b'],
                ['b', 'a'],
                ['a', '0'],
                ['0', 'a'],
            ];
            tests.forEach(t => {
                const test = t[0].naturalCompare(t[1]);
                const target = t[0].localeCompare(t[1]);
                assert.strictEqual(test, target);
            });
        });
        it('should do naturalCompare', () => {
            const tests = [
                ['00', '0', 0],
                ['0', '00', 0],
                ['01', '1', 0],
                ['1', '01', 0],
                ['a1', 'a01', 0],
                ['a01', 'a1', 0],
                ['1a01', '01a1', 0],
                ['10a1', '1a02', 1],
                ['100', '10', 1],
                ['10', '100', -1],
            ];
            tests.forEach((t, i) => {
                const test = (t[0] as string).naturalCompare(t[1] as string);
                assert.strictEqual(test, (t[2] as number), 'Failed on index: ' + i);
            });
        });
        it('should not modify inputs', () => {
            const testA = '100';
            const testB = '20';
            testA.naturalCompare(testB);
            assert.strictEqual(testA, '100');
            assert.strictEqual(testB, '20');

            const testC = '20';
            const testD = '100';
            testC.naturalCompare(testD);
            assert.strictEqual(testC, '20');
            assert.strictEqual(testD, '100');
        });
    });
});
