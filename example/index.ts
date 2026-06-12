import { applyStringExtensions } from '@thewass/wass-lib/extensions/string';
import { applyArrayExtensions } from '@thewass/wass-lib/extensions/array';
import { date2Sql } from '@thewass/wass-lib';
import { hashRow } from '@thewass/wass-lib/node';

applyStringExtensions();
applyArrayExtensions();

const str: string = '';
str.capitalizeFirstLetter();
const dt = date2Sql(new Date());
const hash = hashRow({});
