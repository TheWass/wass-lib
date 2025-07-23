import '@thewass/wass-lib';
import { date2Sql } from '@thewass/wass-lib';
import { groupBy } from '@thewass/wass-lib/node';

const str: string = '';
str.capitalizeFirstLetter();
const dt = date2Sql(new Date());
const group = groupBy([{ thing: 'str' }], { keys: ['thing'] });