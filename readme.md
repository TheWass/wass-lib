WassLib
-------
Common TypeScript and JavaScript helpers for Node and browser-focused projects.

Requirements
------------
- Node 20+

Build
-----
One-click build (ESM + types):

```bash
npm run build
```

The build emits a single ESM output to `dist/`, with `.d.ts` declarations
colocated alongside each `.js` file.

Imports
-------
```ts
import { date2Sql } from '@thewass/wass-lib';
import { hashRow } from '@thewass/wass-lib/node';
import { convertToString } from '@thewass/wass-lib/helpers';
```

ESM only (Breaking in 0.8.0)
----------------------------
This package is now ESM only (`"type": "module"`), published as a single `dist/`
tree. There is no CommonJS build.

TypeScript consumers must resolve it as ESM — the containing package needs
`"type": "module"` (or use an `.mts` file). Under `module: node16`/`nodenext`, a
CommonJS file importing this package is a compile error (TS1479), with
`import()` suggested as the fix.

At runtime, `require('@thewass/wass-lib')` still works on Node versions that
have unflagged `require(esm)` (Node 22.12+ / 20.19+). On older Node 20.x, use a
dynamic `import()` instead.

String and Array prototype extensions are now opt-in and are not applied at import time.

```ts
import { applyStringExtensions } from '@thewass/wass-lib/extensions/string';
import { applyArrayExtensions } from '@thewass/wass-lib/extensions/array';

applyStringExtensions();
applyArrayExtensions();

const title = 'example'.capitalizeFirstLetter();
const chunks = [1, 2, 3, 4].splitToGroupsOf(2);
```