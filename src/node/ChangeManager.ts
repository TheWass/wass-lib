import { convertToString, date2Sql } from '../helpers';
import { hashRow } from '.';
import { DateTime } from 'luxon';

export interface Sql {
    query: string;
    params: Array<unknown>;
}

interface QueryRow {
    data: Record<string, unknown>;
    where: Record<string, unknown>;
}

export interface TableConfig {
    /** Keys to identify duplicates.  If omitted, duplicates will not be identified. */
    primaryKeys?: Array<string>;
    /** Flag indicating whether or not the ID is an autonumber. */
    autoPrimaryKey?: boolean;
    /** Keys to ignore during the detect changes step. */
    ignoreKeys?: string[];
    /** Keys which should be updated, but not awaited.  If these are the only keys updating, the update itself will not be awaited. */
    metadataKeys?: Array<string>;
};

/** 
 * NewRows will replace DBRows.  
 * SQL statements will be generated based on the update keys and primary keys.
 * @param dbRows Existing rows from the database to change.
 * @param newRows New rows to replace existing rows
 * @param updateKeys Keys to differentiate between an insert/delete and an update
 * @param tableConfig Configuration for the target table
 */
export const GenerateChanges = <T extends Record<string, unknown>>(
    dbRows: Array<T>,
    newRows: Array<T>,
    table: string,
    updateKeys: Array<string>,
    tableConfig?: TableConfig
): { insertSqls: Sql[], updateSqls: Sql[], updateNoAwaitSqls: Sql[], deleteSqls: Sql[], dupeSqls: Sql[], insertCt: number } => {
    const { primaryKeys } = tableConfig ?? {};
    const { insertRows, updateRows, updateNoAwaitRows, deleteRows, dupeRows } = identifyRows(dbRows, newRows, updateKeys, tableConfig);

    const insertSqls: Array<Sql> = [];
    for (let i = 0, len = insertRows.length, chunk = 100; i < len; i += chunk) {
        const chunkedRows = insertRows.slice(i, i + chunk);
        const sql = generateInsertSql(table, chunkedRows);
        if (sql != null) insertSqls.push(sql);
    }
    const updateSqls: Array<Sql> = updateRows.reduce((acc, data) => {
        const sql = generateUpdateSql(table, { data, where: mapWheres(data, updateKeys, primaryKeys) });
        if (sql != null) acc.push(sql);
        return acc;
    }, [] as Array<Sql>);
    const updateNoAwaitSqls: Array<Sql> = updateNoAwaitRows.reduce((acc, data) => {
        const sql = generateUpdateSql(table, { data, where: mapWheres(data, updateKeys, primaryKeys) });
        if (sql != null) acc.push(sql);
        return acc;
    }, [] as Array<Sql>);
    const deleteSqls: Array<Sql> = deleteRows.reduce((acc, data) => {
        const sql = generateDeleteSql(table, mapWheres(data, updateKeys, primaryKeys));
        if (sql != null) acc.push(sql);
        return acc;
    }, [] as Array<Sql>);
    const dupeSqls: Array<Sql> = dupeRows.reduce((acc, data) => {
        const sql = generateDeleteSql(table, mapWheres(data, updateKeys, primaryKeys));
        if (sql != null) acc.push(sql);
        return acc;
    }, [] as Array<Sql>);

    return { insertSqls, updateSqls, updateNoAwaitSqls, deleteSqls, dupeSqls, insertCt: insertRows.length };
};

export const generateSelectSql = (table: string, where: Record<string, unknown>): Sql => {
    let sql = 'SELECT * FROM `' + table + '`';
    const whereIds = Object.keys(where);
    let whereValues: unknown[] = [];
    if (whereIds.length > 0) {
        whereValues = whereIds.map((key) => {
            const val = where[key];
            if (val === undefined || (Array.isArray(val) && val.length == 0)) {
                return null;
            }
            if (Array.isArray(val)) {
                return val.distinct();
            }
            return val;
        }).filterNull();
        sql += ' WHERE' + generateWhereClause(where);
    }
    sql += ';';
    return {
        query: sql,
        params: whereValues
    };
};

export const generateInsertSql = (table: string, records: Array<Record<string, unknown>>): Sql|null => {
    if (records.length == 0) {
        return null;
    }
    let sql = 'INSERT INTO `' + table + '` (';
    const propIds = Object.keys(records[0]);
    sql += propIds.map(key => '`' + key + '`').join(', ');
    sql += ') VALUES ?;';
    const insertValues: Array<Array<unknown>> = records.map(record =>
        propIds.map(key => record[key] !== undefined ? record[key] : null)
    );
    return {
        query: sql,
        params: [insertValues]
    };
};

/** This function will only update explicitly.  Any columns not present in record.data will not be modified. */
export const generateUpdateSql = (table: string, record: QueryRow): Sql|null => {
    const propIds = Object.keys(record.data).filter(key => record.data[key] !== undefined);
    if (propIds.length == 0) {
        return null;
    }
    let sql = 'UPDATE `' + table + '` SET';
    const setStatements = propIds.map(key => ' `' + key + '` = ?');
    const setValues = propIds.map(key => record.data[key]);
    sql += setStatements.join(',');

    const whereIds = Object.keys(record.where);
    let whereValues: unknown[] = [];
    if (whereIds.length > 0) {
        whereValues = whereIds.map((key) => {
            const val = record.where[key];
            if (val === undefined || (Array.isArray(val) && val.length == 0)) {
                return null;
            }
            if (Array.isArray(val)) {
                return val.distinct();
            }
            return val;
        }).filterNull();
        sql += ' WHERE' + generateWhereClause(record.where);
    }
    return {
        query: sql + ';',
        params: [...setValues, ...whereValues]
    };
};

export const generateDeleteSql = (table: string, where: Record<string, unknown>): Sql|null => {
    const whereIds = Object.keys(where);
    if (whereIds.length == 0) {
        return null;
    }
    let sql = 'DELETE t FROM `' + table + '` AS t';
    const whereValues = whereIds.map((key) => {
        const val = where[key];
        if (val === undefined || (Array.isArray(val) && val.length == 0)) {
            return null;
        }
        if (Array.isArray(val)) {
            return val.distinct();
        }
        return val;
    }).filterNull();
    sql += ' WHERE' + generateWhereClause(where);
    return {
        query: sql,
        params: whereValues
    };
};

//#region Test Functions
/**
 * This function is meant for testing purposes only.
 * @param dbRows Existing rows from the database
 * @param newRows New rows in the database
 * @param updateKeys Keys to differentiate between an insert/delete and an update
 * @param options Options for the change manager
 */
export const testIdentifyRows = <T extends Record<string, unknown>>(
    dbRows: Array<T>,
    newRows: Array<T>,
    updateKeys: Array<string>,
    tableConfig?: TableConfig
): {
        insertRows: Array<T>,
        updateRows: Array<T>,
        updateNoAwaitRows: Array<T>,
        deleteRows: Array<T>,
        dupeRows: Array<T>
    } => {
    return identifyRows(dbRows, newRows, updateKeys, tableConfig);
}
//#endregion
//#region Private Functions

/**
 * PrimaryKey may not be included with newRow.  If it is present, use it with the UpdateKeys to match
 * PrimaryKeys will identify duplicates currently in the database. Mark them for deletion.
 */
const identifyRows = <T extends Record<string, unknown>> (
    dbRows: Array<T>,
    newRows: Array<T>,
    updateKeys: Array<string>,
    tableConfig?: TableConfig
): {
        insertRows: Array<T>,
        updateRows: Array<T>,
        updateNoAwaitRows: Array<T>,
        deleteRows: Array<T>,
        dupeRows: Array<T>
    } => {
    const { autoPrimaryKey, ignoreKeys, primaryKeys, metadataKeys } = tableConfig ?? {};

    // Clone the rows to avoid modifying the originals.
    const dbRowsCpy = dbRows.map(r => ({ ...r }));
    let newRowsCpy = newRows.map(r => ({ ...r }));
    const dbHashedRows = new Map();
    const dupeHashedRows = new Map();
    //Iterate in reverse for removal.
    for (let i = dbRowsCpy.length - 1; i >= 0; i--) {
        const row = dbRowsCpy[i];
        const hash = hashRow(row, [ ...updateKeys ]);
        if (dbHashedRows.has(hash)) {
            // This is a duplicate in the database.  Splice it out of the where clause.
            // If we're dealing with Primary keys, add it to dupe hash rows.
            if (primaryKeys != null && primaryKeys?.length > 0) {
                const phash = hashRow(row, [ ...primaryKeys, ...updateKeys ]);
                dupeHashedRows.set(phash, row);
            }
            dbRowsCpy.splice(i, 1);
            continue;
        } 
        dbHashedRows.set(hash, row);
    }

    const newHashedRows = new Map();
    for (let i = newRowsCpy.length - 1; i >= 0; i--) {
        const row = newRowsCpy[i];
        // Missing update keys are set to null.
        for (let k = updateKeys.length - 1; k >= 0; k--) {
            const ukey = updateKeys[k] as keyof T;
            if (row[ukey] === undefined) {
                row[ukey] = null as T[keyof T];
            }
        }
        
        const hash = hashRow(row, [ ...updateKeys ]);
        if (newHashedRows.has(hash)) {
            // Found an incoming duplicate.  Remove it.
            newRowsCpy.splice(i, 1);
            continue;
        }
        newHashedRows.set(hash, row);
    }

    // If no dbRows, all are inserts.
    // If no newRows, all are deletes.
    if (dbRowsCpy.length == 0 || newRowsCpy.length == 0) {
        if (autoPrimaryKey && primaryKeys != null && primaryKeys.length > 0) {
            // Inserts can *never* have auto primary keys.  Remove them.
            newRowsCpy = newRowsCpy.map(r => {
                primaryKeys.forEach(k => { delete r[k]; });
                return r;
            });
        }
        return {
            insertRows: newRowsCpy,
            updateRows: [],
            updateNoAwaitRows: [],
            deleteRows: dbRowsCpy,
            dupeRows: []
        };
    }

    const updateRows: Array<T> = [];
    const updateNoAwaitRows: Array<T> = [];
    for (const [keyHash, newRow] of newHashedRows) {
        const dbRow = dbHashedRows.get(keyHash);
        // If we did not find a db row, this is not an update.
        if (!dbRow) {
            continue;
        }
        // We did find a matching DB row, no need to insert or delete.
        // Remove from the new and db maps.
        newHashedRows.delete(keyHash);
        dbHashedRows.delete(keyHash);
        // Keys match. This could be an update. Check if the data does not match...
        let dataDoesNotMatch = false;
        let onlyMetadataUpdated = true;
        const newKeys = Object.keys(newRow);
        // Instead of doing this, maybe, we could hash the whole object...
        for (let index = 0; index < newKeys.length; index++) {
            const key = newKeys[index];
            if (Array.isArray(ignoreKeys) && ignoreKeys.includes(key)) {
                continue; // to the next key.
            }
            let dbVal = dbRow[key];
            let newVal = newRow[key];
            if (newVal === undefined) {
                continue; // Undefined rows are not considered null - They are considered missing.
            }
            // If either are dates, we need to round them both to the nearest second.
            if (dbVal instanceof Date || newVal instanceof Date) {
                if (dbVal instanceof Date) {
                    dbVal = date2Sql(dbVal);
                }
                if (newVal instanceof Date) {
                    newVal = date2Sql(newVal);
                }
                dbVal = Math.round(DateTime.fromSQL(dbVal as string).toSeconds());
                newVal = Math.round(DateTime.fromSQL(newVal as string).toSeconds());
            }
            dbVal = convertToString(dbVal);
            newVal = convertToString(newVal);
            if (dbVal != newVal) {
                dataDoesNotMatch = true;
                onlyMetadataUpdated &&= (Array.isArray(metadataKeys) && metadataKeys.includes(key));
                // If we only have metadata keys updating, we need to continue checking.  
                // We might have a non-metadata key that also updates, which would require an awaited update.
                if (!onlyMetadataUpdated) break;
            }
        } // EndFor (key loop)

        if (dataDoesNotMatch) {
            if (onlyMetadataUpdated) {
                updateNoAwaitRows.push(newRow);
            } else {
                updateRows.push(newRow);
            }
        }
    } // EndFor (newHash loop)

    // Remaining new rows are inserts.
    let insertRows = Array.from(newHashedRows.values());
    // Remaining db rows are deletes.
    const deleteRows = Array.from(dbHashedRows.values());
    const dupeRows = Array.from(dupeHashedRows.values())

    if (autoPrimaryKey && primaryKeys != null && primaryKeys.length > 0) {
        // Inserts can *never* have auto primary keys.  Remove them.
        insertRows = insertRows.map(r => {
            primaryKeys.forEach(k => { delete r[k]; });
            return r;
        });
    }
    return { insertRows, updateRows, updateNoAwaitRows, deleteRows, dupeRows };
};

const mapWheres = (data: Record<string, unknown>, updateKeys: Array<string>, primaryKeys?: Array<string>): Record<string, unknown> => {
    const wStmt: Record<string, unknown> = {};
    if (primaryKeys && primaryKeys.length > 0) {
        primaryKeys.forEach(key => {
            // Primary keys can never be null.
            if (data[key] != null) wStmt[key] = data[key];
        });
    } 
    if (Object.keys(wStmt).length == 0) {
        updateKeys.forEach(key => {
            wStmt[key] = data[key];
        });
    }
    return wStmt;
};

const generateWhereClause = (where: Record<string, unknown>): string => {
    const whereIds = Object.keys(where);
    const whereStatements = whereIds.map(key => {
        const value = where[key];
        let op = '= ?';
        if (value === undefined || value === null) {
            op = 'IS NULL';
        } else if (Array.isArray(value)) {
            if (value.length == 0) {
                // If there's no values in the array, we want to return no records.
                return ' FALSE';
            } 
            op = 'IN (?)';
        }
        return ' `' + key + '` ' + op;
    });
    return whereStatements.join(' AND');
};

//#endregion
