WassLib
-------
Common TypeScript and JavaScript helpers for Node and browser-focused projects.

Requirements
------------
- Node 20+

Build
-----
One-click build (CJS + ESM + types):

```bash
npm run build
```

The build emits:
- `dist/cjs` for CommonJS consumers
- `dist/esm` for ESM and modern bundlers
- `dist/types` for TypeScript type definitions

Imports
-------
```ts
import { date2Sql } from '@thewass/wass-lib';
import { hashRow } from '@thewass/wass-lib/node';
import { convertToString } from '@thewass/wass-lib/helpers';
```

Extension APIs (Breaking)
-------------------------
String and Array prototype extensions are now opt-in and are not applied at import time.

```ts
import { applyStringExtensions } from '@thewass/wass-lib/extensions/string';
import { applyArrayExtensions } from '@thewass/wass-lib/extensions/array';

applyStringExtensions();
applyArrayExtensions();

const title = 'example'.capitalizeFirstLetter();
const chunks = [1, 2, 3, 4].splitToGroupsOf(2);
```

Migration Notes
---------------
- Replace side-effect extension imports with explicit `apply*Extensions()` calls.
- Package subpaths are resolved through `exports` and target modern tooling.