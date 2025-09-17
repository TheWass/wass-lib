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

/** 
 * NewRows will replace DBRows.  
 * SQL statements will be generated based on the update keys and primary keys.
 * @param dbRows Existing rows from the database to change.
 * @param newRows New rows to replace existing rows
 * @param table Table to target
 * @param updateKeys Keys to differentiate between an insert/delete and an update
 * @param primaryKeys Keys to identify duplicates
 * @param autoPrimaryKey Flag indicating whether or not the ID is an autonumber or not.
 */
export const GenerateChanges = async <T extends Record<string, unknown>>(
    dbRows: Array<T>,
    newRows: Array<T>,
    table: string,
    updateKeys: Array<string>,
    primaryKeys?: Array<string>,
    autoPrimaryKey: boolean = false
): Promise<{ insertSqls: Sql[], updateSqls: Sql[], deleteSqls: Sql[], dupeSqls: Sql[] }> => {
    const { insertRows, updateRows, deleteRows, dupeRows } = identifyRows(dbRows, newRows, updateKeys, primaryKeys, autoPrimaryKey);

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

    return { insertSqls, updateSqls, deleteSqls, dupeSqls };
};

//#region Test Functions
/**
 * This function is meant for testing purposes only.
 * @param dbRows Existing rows from the database
 * @param newRows New rows in the database
 * @param updateKeys Keys to differentiate between an insert/delete and an update
 * @param autoPrimaryKey If included, this will remove duplicates in the database.
 */
export const testIdentifyRows = <T extends Record<string, unknown>>(
    dbRows: Array<T>,
    newRows: Array<T>,
    updateKeys: Array<string>,
    primaryKeys?: Array<string>,
    autoPrimaryKey: boolean = false): {
        insertRows: Array<T>,
        updateRows: Array<T>,
        deleteRows: Array<T>,
        dupeRows: Array<T>
    } => {
    return identifyRows(dbRows, newRows, updateKeys, primaryKeys,  autoPrimaryKey);
}

export const testGenerateUpdateSql = <T extends Record<string, unknown>>(table: string, data: T, where: Record<string, unknown>): Sql|null => {
    return generateUpdateSql(table, { data, where });
};

export const testGenerateSelectSql = (table: string, where: Record<string, unknown>): Sql => {
    return generateSelectSql(table, where);
};
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
    primaryKeys?: Array<string>,
    autoPrimaryKey: boolean = false): {
        insertRows: Array<T>,
        updateRows: Array<T>,
        deleteRows: Array<T>,
        dupeRows: Array<T>
    } => {

    const dbHashedRows = new Map();
    const dupeHashedRows = new Map();
    //Iterate in reverse for removal.
    for (let i = dbRows.length - 1; i >= 0; i--) {
        const row = dbRows[i];
        const hash = hashRow(row, [ ...updateKeys ]);
        if (dbHashedRows.has(hash)) {
            // This is a duplicate in the database.  Splice it out of the where clause.
            // If we're dealing with Primary keys, add it to dupe hash rows.
            if (primaryKeys != null && primaryKeys?.length > 0) {
                const phash = hashRow(row, [ ...primaryKeys, ...updateKeys ]);
                dupeHashedRows.set(phash, row);
            }
            dbRows.splice(i, 1);
            continue;
        } 
        dbHashedRows.set(hash, row);
    }

    const newHashedRows = new Map();
    for (let i = newRows.length - 1; i >= 0; i--) {
        const row = newRows[i];
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
            newRows.splice(i, 1);
            continue;
        }
        newHashedRows.set(hash, row);
    }

    // If no dbRows, all are inserts.
    // If no newRows, all are deletes.
    if (dbRows.length == 0 || newRows.length == 0) {
        if (primaryKeys != null && primaryKeys.length > 0 && autoPrimaryKey) {
            // Inserts can *never* have primary keys.  Remove them.
            newRows = newRows.map(r => {
                primaryKeys.forEach(k => { delete r[k]; });
                return r;
            });
        }
        return {
            insertRows: newRows,
            updateRows: [],
            deleteRows: dbRows,
            dupeRows: []
        };
    }

    const updateRows: Array<T> = [];
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
        const newKeys = Object.keys(newRow);
        // Instead of doing this, maybe, we could hash the whole object...
        for (let index = 0; index < newKeys.length; index++) {
            const key = newKeys[index];
            if (key == 'ModifiedAt' || key == 'CreatedAt') {
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
                break; // from the key loop
            }
        } // EndFor (key loop)

        if (dataDoesNotMatch) {
            updateRows.push(newRow);
        }
    } // EndFor (newHash loop)

    // Remaining new rows are inserts.
    let insertRows = Array.from(newHashedRows.values());
    // Remaining db rows are deletes.
    const deleteRows = Array.from(dbHashedRows.values());
    const dupeRows = Array.from(dupeHashedRows.values())

    if (primaryKeys != null && primaryKeys.length > 0 && autoPrimaryKey) {
        // Inserts can *never* have primary keys.  Remove them.
        insertRows = insertRows.map(r => {
            primaryKeys.forEach(k => { delete r[k]; });
            return r;
        });
    }
    return { insertRows, updateRows, deleteRows, dupeRows };
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

const generateSelectSql = (table: string, where: Record<string, unknown>): Sql => {
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

const generateInsertSql = (table: string, records: Array<Record<string, unknown>>): Sql|null => {
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
const generateUpdateSql = (table: string, record: QueryRow): Sql|null => {
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

const generateDeleteSql = (table: string, where: Record<string, unknown>): Sql|null => {
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
