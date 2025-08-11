WassLib
-------
This is a TS Library where I keep my commonly used, generic functions and modules consolidated and up to date.

Node-only functions are found here: 
```
    import {} from "@thewass/wass-lib/node";
```

JS extensions are found here:
```
    import "@thewass/wass-lib/extensions/string";
    import "@thewass/wass-lib/extensions/array";
```

Future improvements:
* AbortablePromise.
* AbortableHttpCall.

Requirements for version 1.0:
* Remove Luxon dependency.
* JSDoc all functions.
* Generate API docs for Github pages.
* E2E tests for Node, React, Browser.
* Installation instructions in the readme.