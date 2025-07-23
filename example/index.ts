import '@thewass/wass-lib/extensions/string';
import '@thewass/wass-lib/extensions/array';
import { date2Sql } from '@thewass/wass-lib';
import { groupBy } from '@thewass/wass-lib/node';
import { from, ErrorNotification } from 'rxjs';

const str: string = '';
str.capitalizeFirstLetter();
const dt = date2Sql(new Date());
const group = groupBy([{ thing: 'str' }], { keys: ['thing'] });
from([0, 1, 2])