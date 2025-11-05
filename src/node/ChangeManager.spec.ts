import { assert } from 'chai';
import { describe, it } from 'mocha';
import * as changeManager from './ChangeManager.js';
import '@thewass/wass-lib/extensions/array';
import '@thewass/wass-lib/extensions/string';

const identifyRows = changeManager.testIdentifyRows;
const generateUpdateSql = changeManager.generateUpdateSql;
const generateSelectSql = changeManager.generateSelectSql;

describe('ChangeManager', () => {
    describe('IdentifyRows', () => {
        describe('Base cases', () => {
            it('All new rows', () => {
                const updateKeys = ['a', 'b'];
                const dbRows = [] as Array<Record<string, string>>;
                const newRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a2', b: 'b2', c: 'c2', d: 'd2' },
                    { a: 'a3', b: 'b3', c: 'c3', d: 'd3' },
                    { a: 'a4', b: 'b4', c: 'c4', d: 'd4' },
                    { a: 'a5', b: 'b5', c: 'c5', d: 'd5' },
                    { a: 'a6', b: 'b6', c: 'c6', d: 'd6' },
                    { a: 'a7', b: 'b7', c: 'c7', d: 'd7' },
                ];
                const results = identifyRows(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 7, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 0, 'Update failed.');
            });
            it('All old rows', () => {
                const updateKeys = ['a', 'b'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a2', b: 'b2', c: 'c2', d: 'd2' },
                    { a: 'a3', b: 'b3', c: 'c3', d: 'd3' },
                    { a: 'a4', b: 'b4', c: 'c4', d: 'd4' },
                    { a: 'a5', b: 'b5', c: 'c5', d: 'd5' },
                    { a: 'a6', b: 'b6', c: 'c6', d: 'd6' },
                    { a: 'a7', b: 'b7', c: 'c7', d: 'd7' },
                ];
                const newRows = [] as Array<Record<string, string>>;
                const results = identifyRows(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 7, 'Delete failed.');
                assert.equal(results.updateRows.length, 0, 'Update failed.');
            });
            it('All same', () => {
                const updateKeys = ['a', 'b'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a2', b: 'b2', c: 'c2', d: 'd2' },
                    { a: 'a3', b: 'b3', c: 'c3', d: 'd3' },
                    { a: 'a4', b: 'b4', c: 'c4', d: 'd4' },
                    { a: 'a5', b: 'b5', c: 'c5', d: 'd5' },
                    { a: 'a6', b: 'b6', c: 'c6', d: 'd6' },
                    { a: 'a7', b: 'b7', c: 'c7', d: 'd7' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a2', b: 'b2', c: 'c2', d: 'd2' },
                    { a: 'a3', b: 'b3', c: 'c3', d: 'd3' },
                    { a: 'a4', b: 'b4', c: 'c4', d: 'd4' },
                    { a: 'a5', b: 'b5', c: 'c5', d: 'd5' },
                    { a: 'a6', b: 'b6', c: 'c6', d: 'd6' },
                    { a: 'a7', b: 'b7', c: 'c7', d: 'd7' },
                ];
                const results = identifyRows(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 0, 'Update failed.');
            });
            it('All updates', () => {
                const updateKeys = ['a', 'b'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a2', b: 'b2', c: 'c2', d: 'd2' },
                    { a: 'a3', b: 'b3', c: 'c3', d: 'd3' },
                    { a: 'a4', b: 'b4', c: 'c4', d: 'd4' },
                    { a: 'a5', b: 'b5', c: 'c5', d: 'd5' },
                    { a: 'a6', b: 'b6', c: 'c6', d: 'd6' },
                    { a: 'a7', b: 'b7', c: 'c7', d: 'd7' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', c: 'c2', d: 'd2' },
                    { a: 'a2', b: 'b2', c: 'c3', d: 'd3' },
                    { a: 'a3', b: 'b3', c: 'c4', d: 'd4' },
                    { a: 'a4', b: 'b4', c: 'c5', d: 'd5' },
                    { a: 'a5', b: 'b5', c: 'c6', d: 'd6' },
                    { a: 'a6', b: 'b6', c: 'c7', d: 'd7' },
                    { a: 'a7', b: 'b7', c: 'c8', d: 'd8' },
                ];
                const results = identifyRows(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 7, 'Update failed.');
            });
            it('Mixture', () => {
                const updateKeys = ['a', 'b'];
                const dbRows = [
                    { a: 'a2', b: 'b2', c: 'c2', d: 'd2' },
                    { a: 'a3', b: 'b3', c: 'c3', d: 'd3' },
                    { a: 'a4', b: 'b4', c: 'c4', d: 'd4' },
                    { a: 'a5', b: 'b5', c: 'c5', d: 'd5' },
                    { a: 'a6', b: 'b6', c: 'c6', d: 'd6' },
                    { a: 'a7', b: 'b7', c: 'c7', d: 'd7' },
                    { a: 'a8', b: 'b8', c: 'c8', d: 'd8' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', c: 'c2', d: 'd2' },
                    { a: 'a4', b: 'b4', c: 'c5', d: 'd5' },
                    { a: 'a5', b: 'b5', c: 'c6', d: 'd6' },
                    { a: 'a6', b: 'b6', c: 'c7', d: 'd7' },
                    { a: 'a7', b: 'b7', c: 'c7', d: 'd7' },
                    { a: 'a8', b: 'b8', c: 'c8', d: 'd8' },
                ];
                const results = identifyRows(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 1, 'Insert failed.');
                assert.equal(results.deleteRows.length, 2, 'Delete failed.');
                assert.equal(results.updateRows.length, 3, 'Update failed.');
            });
        });
        describe('Duplicate cases', () => {
            it('New dupes', () => {
                const updateKeys = ['a', 'b', 'c'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a2', b: 'b2', c: 'c2', d: 'd2' },
                    { a: 'a3', b: 'b3', c: 'c3', d: 'd3' },
                    { a: 'a4', b: 'b4', c: 'c4', d: 'd4' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a2', b: 'b2', c: 'c2', d: 'd2' },
                    { a: 'a3', b: 'b3', c: 'c3', d: 'd3' },
                    { a: 'a4', b: 'b4', c: 'c4', d: 'd4' },
                    { a: 'a5', b: 'b5', c: 'c5', d: 'd5' },
                    { a: 'a5', b: 'b5', c: 'c5', d: 'd5' },
                    { a: 'a5', b: 'b5', c: 'c5', d: 'd5' },
                ];
                const results = identifyRows(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 1, 'Insert failed.');
                assert.equal(results.insertRows[0].a, 'a5');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 0, 'Update failed.');
                assert.equal(dbRows.length, 4, 'DBRows input was modified.');
                assert.equal(newRows.length, 9, 'NewRows input was modified.');
            });
            it('Existing dupes', () => {
                const updateKeys = ['a', 'b', 'c'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a2', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a3', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a4', b: 'b2', c: 'c2', d: 'd2' },
                    { a: 'a5', b: 'b3', c: 'c3', d: 'd3' },
                    { a: 'a6', b: 'b4', c: 'c4', d: 'd4' },
                ];
                const newRows = [
                    { a: 'a2', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a4', b: 'b2', c: 'c2', d: 'd2' },
                    { a: 'a5', b: 'b3', c: 'c3', d: 'd3' },
                    { a: 'a6', b: 'b4', c: 'c4', d: 'd4' },
                ];
                const results = identifyRows(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 2, 'Delete failed.');
                assert.equal(results.updateRows.length, 0, 'Update failed.');
                // identifyRows operates in reverse order.
                assert.equal(results.deleteRows[0].a, 'a3');
                assert.equal(results.deleteRows[1].a, 'a1');
                assert.equal(dbRows.length, 6, 'DBRows input was modified.');
                assert.equal(newRows.length, 4, 'NewRows input was modified.');
            });
            it('Never Insert Dupes', () => {
                const updateKeys = ['a', 'b', 'c'];
                const dbRows = [] as Array<Record<string, string>>;
                const newRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a2', b: 'b2', c: 'c2', d: 'd2' },
                    { a: 'a3', b: 'b3', c: 'c3', d: 'd3' },
                    { a: 'a4', b: 'b4', c: 'c4', d: 'd4' },
                ];
                const results = identifyRows(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 4, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 0, 'Update failed.');
            });
            it('All delete existing dupes', () => {
                const updateKeys = ['a', 'b', 'c'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a2', b: 'b2', c: 'c2', d: 'd2' },
                    { a: 'a3', b: 'b3', c: 'c3', d: 'd3' },
                    { a: 'a4', b: 'b4', c: 'c4', d: 'd4' },
                ];
                const newRows = [] as Array<Record<string, string>>;
                const results = identifyRows(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                // The duplicate deletions are covered with a single delete command.
                assert.equal(results.deleteRows.length, 4, 'Delete failed.');
                assert.equal(results.updateRows.length, 0, 'Update failed.');
            });
        });
        describe('Primary Keys', () => {
            it('handles primary keys only in dbRows, not in newRows', () => {
                const updateKeys = ['a', 'b'];
                const primaryKeys = ['p'];
                const dbRows = [
                    { p: 1, a: 'a2', b: 'b2', c: 'c2', d: 'd2' },
                    { p: 2, a: 'a3', b: 'b3', c: 'c3', d: 'd3' },
                    { p: 3, a: 'a4', b: 'b4', c: 'c4', d: 'd4' },
                    { p: 4, a: 'a5', b: 'b5', c: 'c5', d: 'd5' },
                    { p: 5, a: 'a6', b: 'b6', c: 'c6', d: 'd6' },
                    { p: 6, a: 'a7', b: 'b7', c: 'c7', d: 'd7' },
                    { p: 7, a: 'a8', b: 'b8', c: 'c8', d: 'd8' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', c: 'c2', d: 'd2' },
                    { a: 'a4', b: 'b4', c: 'c5', d: 'd5' },
                    { a: 'a5', b: 'b5', c: 'c6', d: 'd6' },
                    { a: 'a6', b: 'b6', c: 'c7', d: 'd7' },
                    { a: 'a7', b: 'b7', c: 'c7', d: 'd7' },
                    { a: 'a8', b: 'b8', c: 'c8', d: 'd8' },
                ];
                const results = identifyRows(dbRows, newRows, updateKeys, primaryKeys, true);
                assert.equal(results.insertRows.length, 1, 'Insert failed.');
                assert.equal(results.deleteRows.length, 2, 'Delete failed.');
                assert.equal(results.updateRows.length, 3, 'Update failed.');
                assert.equal(results.dupeRows.length, 0, 'Dupe failed.');
            });
            it('handles primary keys in dbRows, some in newRows', () => {
                const updateKeys = ['a', 'b'];
                const primaryKeys = ['p'];
                const dbRows = [
                    { p: 1, a: 'a2', b: 'b2', c: 'c2', d: 'd2' }, //delete
                    { p: 2, a: 'a3', b: 'b3', c: 'c3', d: 'd3' }, //delete
                    { p: 3, a: 'a4', b: 'b4', c: 'c4', d: 'd4' }, //update
                    { p: 4, a: 'a5', b: 'b5', c: 'c5', d: 'd5' }, //update
                    { p: 5, a: 'a6', b: 'b6', c: 'c6', d: 'd6' }, //delete*
                    { p: 6, a: 'a8', b: 'b8', c: 'c7', d: 'd7' }, //nochange
                    { p: 7, a: 'a9', b: 'b9', c: 'c8', d: 'd8' }, //nochange
                ];
                const newRows = [
                    {       a: 'a1', b: 'b1', c: 'c2', d: 'd2' }, //insert
                    { p: 3, a: 'a4', b: 'b4', c: 'c5', d: 'd5' }, //update
                    {       a: 'a5', b: 'b5', c: 'c6', d: 'd6' }, //update
                    { p: 5, a: 'a7', b: 'b7', c: 'c7', d: 'd7' }, //insert*
                    { p: 6, a: 'a8', b: 'b8', c: 'c7', d: 'd7' }, //nochange
                    {       a: 'a9', b: 'b9', c: 'c8', d: 'd8' }, //nochange
                ];
                const results = identifyRows(dbRows, newRows, updateKeys, primaryKeys, true);
                assert.equal(results.insertRows.length, 2, 'Insert failed.');
                // All inserted rows should never have primary keys
                assert.equal(results.insertRows[0].p, null); // Not strictly null, undefined is OK.
                assert.equal(results.insertRows[1].p, null);
                assert.equal(results.deleteRows.length, 3, 'Delete failed.');
                assert.equal(results.updateRows.length, 2, 'Update failed.');
                assert.equal(results.dupeRows.length, 0, 'Dupe failed.');
            });
            it('Marks duplicate database entries for deletion', () => {
                const primaryKeys = ['p'];
                const updateKeys = ['b', 'c'];
                const dbRows = [
                    { p: 1, b: 'b1', c: 'c1', d: 'd1' },
                    { p: 2, b: 'b1', c: 'c1', d: 'd1' },
                    { p: 3, b: 'b1', c: 'c1', d: 'd1' },
                    { p: 4, b: 'b2', c: 'c2', d: 'd2' },
                    { p: 5, b: 'b3', c: 'c3', d: 'd3' },
                    { p: 6, b: 'b4', c: 'c4', d: 'd4' },
                ];
                const newRows = [
                    { b: 'b1', c: 'c1', d: 'd1' },
                    { b: 'b2', c: 'c2', d: 'd2' },
                    { b: 'b3', c: 'c3', d: 'd3' },
                    { b: 'b4', c: 'c4', d: 'd4' },
                ];
                const results = identifyRows<Record<string, unknown>>(dbRows, newRows, updateKeys, primaryKeys, true);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 0, 'Update failed.');
                assert.equal(results.dupeRows.length, 2, 'Dupe failed.');
                // identifyRows operates in reverse order.
                assert.equal(results.dupeRows[0].p, 2);
                assert.equal(results.dupeRows[1].p, 1);
            });
            it('handles primary keys are update keys, and no duped new rows', () => {
                const updateKeys = ['a', 'b'];
                const dbRows = [
                    { a: 'a2', b: 'b2', c: 'c2', d: 'd2' },
                    { a: 'a3', b: 'b3', c: 'c3', d: 'd3' },
                    { a: 'a4', b: 'b4', c: 'c4', d: 'd4' },
                    { a: 'a5', b: 'b5', c: 'c5', d: 'd5' },
                    { a: 'a6', b: 'b6', c: 'c6', d: 'd6' },
                    { a: 'a7', b: 'b7', c: 'c7', d: 'd7' },
                    { a: 'a8', b: 'b8', c: 'c8', d: 'd8' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', c: 'c2', d: 'd2' },
                    { a: 'a1', b: 'b1', c: 'c3', d: 'd3' },
                    { a: 'a4', b: 'b4', c: 'c5', d: 'd5' },
                    { a: 'a5', b: 'b5', c: 'c6', d: 'd6' },
                    { a: 'a6', b: 'b6', c: 'c7', d: 'd7' },
                    { a: 'a7', b: 'b7', c: 'c7', d: 'd7' },
                    { a: 'a8', b: 'b8', c: 'c8', d: 'd8' },
                ];
                const results = identifyRows(dbRows, newRows, updateKeys, updateKeys, false);
                assert.equal(results.insertRows.length, 1, 'Insert failed.');
                assert.equal(results.deleteRows.length, 2, 'Delete failed.');
                assert.equal(results.updateRows.length, 3, 'Update failed.');
                assert.equal(results.dupeRows.length, 0, 'Dupe failed.');
            });
        });
        describe('Nulls / Unknowns', () => {
            it('does not change missing columns', () => {
                const updateKeys = ['a', 'b'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', d: 'd1' },
                ];
                const results = identifyRows(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 0, 'Update failed.');
            });
            it('does not change undefined columns', () => {
                const updateKeys = ['a', 'b'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', c: undefined, d: 'd1' },
                ];
                const results = identifyRows<Record<string, unknown>>(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 0, 'Update failed.');
                // Params will only contain the SET params.
            });
            it('does change null columns', () => {
                const updateKeys = ['a', 'b'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', c: null, d: 'd1' },
                ];
                const results = identifyRows<Record<string, unknown>>(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 1, 'Update failed.');
                // Params will only contain the SET params.
            });
            it('does not set missing columns for update', () => {
                const updateKeys = ['a', 'b'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', d: 'd2' },
                ];
                const results = identifyRows<Record<string, unknown>>(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 1, 'Update failed.');
                assert.isUndefined(results.updateRows[0].c);
                const sql = generateUpdateSql('test', { data: results.updateRows[0], where: {} });
                // Params will only contain the SET params.
                assert.deepEqual(sql?.params, ['a1', 'b1', 'd2']);
            });
            it('does not set undefined columns for update', () => {
                const updateKeys = ['a', 'b'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', c: undefined, d: 'd2' },
                ];
                const results = identifyRows<Record<string, unknown>>(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 1, 'Update failed.');
                assert.isUndefined(results.updateRows[0].c);
                const sql = generateUpdateSql('test', { data: results.updateRows[0], where: {} });
                // Params will only contain the SET params.
                assert.deepEqual(sql?.params, ['a1', 'b1', 'd2']);
            });
            it('does set null values for update', () => {
                const updateKeys = ['a', 'b'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', c: null, d: 'd1' },
                ];
                const results = identifyRows<Record<string, unknown>>(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 1, 'Update failed.');
                assert.isNull(results.updateRows[0].c);
                const sql = generateUpdateSql('test', { data: results.updateRows[0], where: {} });
                // Params will only contain the SET params.
                assert.deepEqual(sql?.params, ['a1', 'b1', null, 'd1']);
            });
            //TODO: I really don't like this, I'd rather it error. But, this is how it has always worked, and changing it might break more than what I'd be expecting.
            it('sets missing update keys to null', () => {
                const updateKeys = ['a', 'b'];
                const dbRows = [
                    { a: 'a1', b: null, c: 'c1', d: 'd1' },
                ];
                const newRows = [
                    { a: 'a1', c: 'c1', d: 'd1' },
                ];
                const results = identifyRows(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 0, 'Update failed.');
            });
        });
        describe('Type Fluidity', () => {
            it('autocasts from string to number', () => {
                const updateKeys = ['a'];
                const dbRows = [
                    { a: 'a1', b: 'b2', c: '56.7', d: 'd1' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b2', c: 56.7, d: 'd1' },
                ];
                const results = identifyRows<Record<string, unknown>>(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 0, 'Update failed.');
            });
            it('autocasts from number to string', () => {
                const updateKeys = ['a'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: 56.7, d: 'd1' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', c: '56.7', d: 'd1' },
                ];
                const results = identifyRows<Record<string, unknown>>(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 0, 'Update failed.');
            });
            it('handles 0.00 to 0', () => {
                const updateKeys = ['a'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: '0.00', d: 'd1' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', c: '0', d: 'd1' },
                ];
                const results = identifyRows<Record<string, unknown>>(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 0, 'Update failed.');
            });
            it('handles 0 to 0.00', () => {
                const updateKeys = ['a'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: '0', d: 'd1' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', c: '0.00', d: 'd1' },
                ];
                const results = identifyRows<Record<string, unknown>>(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 0, 'Update failed.');
            });
            it('handles false to 0', () => {
                const updateKeys = ['a'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: false, d: 'd1' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', c: '0', d: 'd1' },
                ];
                const results = identifyRows<Record<string, unknown>>(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 0, 'Update failed.');
            });
            it('handles 0 to false', () => {
                const updateKeys = ['a'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: '0', d: 'd1' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', c: false, d: 'd1' },
                ];
                const results = identifyRows<Record<string, unknown>>(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 0, 'Update failed.');
            });
        });
        describe('Edge cases', () => {
            it('New dupes with update first', () => {
                const updateKeys = ['a', 'b'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', c: 'c2', d: 'd2' },
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                ];
                const results = identifyRows(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 0, 'Update failed.');
            });
            it('New dupes with update mid', () => {
                const updateKeys = ['a', 'b'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a1', b: 'b1', c: 'c2', d: 'd2' },
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                ];
                const results = identifyRows(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                assert.equal(results.updateRows.length, 0, 'Update failed.');
            });
            it('New dupes with update end', () => {
                const updateKeys = ['a', 'b'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a1', b: 'b1', c: 'c2', d: 'd2' },
                ];
                const results = identifyRows(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 0, 'Delete failed.');
                // TODO: This shouldn't update.
                assert.equal(results.updateRows.length, 1, 'Update failed.');
            });
            it('Existing dupes with update first', () => {
                const updateKeys = ['a', 'b'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: 'c2', d: 'd2' },
                    { a: 'a2', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a3', b: 'b1', c: 'c1', d: 'd1' },
                ];
                const newRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                ];
                const results = identifyRows(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 2, 'Delete failed.');
                assert.equal(results.updateRows.length, 1, 'Update failed.');
            });
            it('Existing dupes with update mid', () => {
                const updateKeys = ['a', 'b'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a2', b: 'b1', c: 'c2', d: 'd2' },
                    { a: 'a3', b: 'b1', c: 'c1', d: 'd1' },
                ];
                const newRows = [
                    { a: 'a2', b: 'b1', c: 'c1', d: 'd1' },
                ];
                const results = identifyRows(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 2, 'Delete failed.');
                assert.equal(results.updateRows.length, 1, 'Update failed.');
            });
            it('Existing dupes with update end', () => {
                const updateKeys = ['a', 'b'];
                const dbRows = [
                    { a: 'a1', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a2', b: 'b1', c: 'c1', d: 'd1' },
                    { a: 'a3', b: 'b1', c: 'c2', d: 'd2' },
                ];
                const newRows = [
                    { a: 'a3', b: 'b1', c: 'c1', d: 'd1' },
                ];
                const results = identifyRows(dbRows, newRows, updateKeys);
                assert.equal(results.insertRows.length, 0, 'Insert failed.');
                assert.equal(results.deleteRows.length, 2, 'Delete failed.');
                assert.equal(results.updateRows.length, 1, 'Update failed.');
            });
        });
    });
    describe('GenerateSelect', () => {
        // This also excersizes the function to generate the where clause shared with update and delete.
        it('Generates sql', () => {
            const where = {
                RealmId: '12384239',
                AccountId: '42',
            };
            const sql = generateSelectSql('table', where);
            assert.equal(sql.query, 'SELECT * FROM `table` WHERE `RealmId` = ? AND `AccountId` = ?;');
            assert.equal(sql.params[0], '12384239');
            assert.equal(sql.params[1], '42');
        });
        it('handles arrays', () => {
            const where = {
                RealmId: '12384239',
                AccountId: ['42', '43'],
            };
            const sql = generateSelectSql('table', where);
            assert.equal(sql.query, 'SELECT * FROM `table` WHERE `RealmId` = ? AND `AccountId` IN (?);');
            assert.equal(sql.params[0], '12384239');
            assert.equal((sql.params[1] as string[])[0], '42');
            assert.equal((sql.params[1] as string[])[1], '43');
        });
        it('handles empty arrays', () => {
            const where = {
                RealmId: '12384239',
                AccountId: [],
                TestId: '43'
            };
            const sql = generateSelectSql('table', where);
            assert.equal(sql.query, 'SELECT * FROM `table` WHERE `RealmId` = ? AND FALSE AND `TestId` = ?;');
            assert.equal(sql.params[0], '12384239');
            assert.equal(sql.params[1], '43');
        });
        it('handles null', () => {
            const where = {
                RealmId: '12384239',
                AccountId: null,
            };
            const sql = generateSelectSql('table', where);
            assert.equal(sql.query, 'SELECT * FROM `table` WHERE `RealmId` = ? AND `AccountId` IS NULL;');
            assert.equal(sql.params[0], '12384239');
            assert.isUndefined(sql.params[1]);
        });
    })
});
