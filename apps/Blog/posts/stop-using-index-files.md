# Why you should stop using index files

If you are a front-end developer, you probably often use index files, and you
probably find them very useful.

However, did you know that they have significant drawbacks, especially regarding
performance?

## What are index files?

Index files have been introduced by Node.js import mechanism, i.e. require, that
will look for a `index.js` file whether you provide a path to a directory.

For example, `require('src/components')` will attempt to load
`src/components/index.js`.

This behavior was later retained by modern bundlers like Webpack, although it is
not part of the ECMAScript modules standard.

## What are they used for?

Index files have 2 mains roles in recent front-end projects:

### Act as proxy to make imports shorter

Given you have a `Button.jsx` component located in a `components/Button` folder
among other related files, like styles.

If you want to use your component, you will have Button twice in the import
path, as is:

```js
import { Button } from 'components/Button/Button';
```

Now, add an `index.js` file in the `Button` folder with the following content:

```js
export { Button } from './Button';
```

Thanks to the index file, you can make your component's import shorter:

```js
import { Button } from 'components/Button';
```

### Group child exports

In addition to have shorter imports, index files also allow to reduce their
number.

Let's go back to our `components` folder but with 2 components in it: `Button`
and `Link`.

If we want to use both in the same place without using any index
file, here are the imports:

```js
import { Button } from 'components/Button/Button';
import { Link } from 'components/Link/Link';
```

Now, add an `index.js` file in the `components` folder that exports both
components:

```js
export { Button } from './Button/Button';
export { Link } from './Link/Link';
```

We can now import our 2 components with only 1 line:

```js
import { Button, Link } from 'components';
```

Isn't that beautiful? Not really, but we'll see that in the next section.

## Why shouldn't they be used?

Unfortunately, using index files also has more or less annoying drawbacks.

Here is a probably incomplete list:

- **They add noise in the file structure.**

  Yes, having index files in almost every folder of your application can be
  considered as noise.

- **They make lost the developers not used to this pattern.**

  This can be especially annoying if you work in multidisciplinary teams and
  back-end developers have to read front-end code now and then.

- **They lead to circular dependencies.**

  Usually, the more you have exports in a unique file, the more this file will
  be imported by others, and the more likely you are to create circular
  dependencies.

  I had the opportunity to validate this in personal projects.

- **They can lead to compilation errors.**

  This one is a bit specific but if you are working on JavaScript code that can
  be rendered in both server and client side (i.e. a Next.js application), you
  may have some files that are intended to be executed only on one side.

  Reexporting these in index files can cause compilation errors as they will be
  compiled for a context for which they were not intended.

  Like I said, it's pretty specific but Next.js is a popular framework, and we
  ran into this issue recently in my team.

- **They prevent Webpack from splitting chunks correctly.**

  ![{ "alt": "Boom!", "height": 180, "width": 292 }](/blog/stop-using-index-files/boom.jpg)

  This is really annoying issue that is quite easy to demonstrate, let's do it
  in the next section.

## How index files prevent Webpack to split chunks

### What is Webpack?

[Webpack](https://webpack.js.org/) is a popular _bundler_ for front-end
applications, it takes your source files as input and generates bundles that can
be executed by browsers.

To make your application faster, Webpack will automatically optimise it by
removing unused code and by splitting the output code into smaller pieces called
_chunks_ when possible.

Webpack also allows lazy loading some code by using
[dynamic imports](https://github.com/tc39/proposal-dynamic-import).

Here are some common use cases where these features could be helpful:

- If you have multiple pages and use a given library in only one of them, you
  don't want it to be loaded everywhere.

- If you need to use a very big library in a very specific context, you may want
  to lazy load it not to impact users that won't need it.

As you can see, the optimizations of Webpack are very interesting, and it is not
desirable at all to break them, especially lately when mobile is taking an
increasingly part of web traffic.

### How Webpack split code

The point that will particularly interest us regarding Webpack
[Code Splitting](https://webpack.js.org/guides/code-splitting/) is the
fact that it will try to group the code by _module_ to generate its chunks.

Any imported file is considered as a module by Webpack.

This means that when you create index files containing multiple exports,
**you are telling Webpack that all these exports are part of the same module**,
i.e. the index file.

## Use case

To demonstrate the issue, I picked a pretty simple use case where I use 2
components in a page entrypoint:

- A first component will always be used.
- A second component will be loaded on demand.

Those components are respectively exporting a string containing several
occurrences of their names to make them big enough to represent some standard
components.

If you want to reproduce the following experiments yourself,
[here is the repository](https://github.com/josselinbuils/index-tests)
containing the demonstration code.

### First case: usage of an index file

I will generate a bundle using Webpack 5 from a first entrypoint called
`withIndex.js` where I use an index file to load both components:

```js
// webpack.config.js

module.exports = {
  entry: {
    withIndex: './src/withIndex',
  },
};

// src/components/index.js

export { component1 } from './component1';
export { component2 } from './component2';

// src/withIndex.js

import { component1 } from './components';

document.body.innerText = component1;

window.doStuff = () =>
  import('./components').then(
    ({ component2 }) => (document.body.innerText += component2)
  );
```

As you can see, I kept a very basic Webpack configuration with the default
optimisations.

If I run the `webpack` command, it will generate a unique `withIndex.js` bundle
with the following (partial) content:

```js
// dist/withIndex.js

(() => {
  'use strict';
  var o = {
    693: (n, o, e) => {
      e.r(o), e.d(o, { component1: () => t, component2: () => p });
      const t = '\ncomponent1\ncomponent1\ncomponent1\ncomponent1[...]',
        p = '\ncomponent2\ncomponent2\ncomponent2\ncomponent2[...]';
    },
  };
  (document.body.innerText = n.component1),
    (window.doStuff = () =>
      Promise.resolve()
        .then(t.bind(t, 693))
        .then(({ component2: n }) => (document.body.innerText += n)));
})();
```

You can see that both components have been embed in the generated bundle 😱

It means that your dynamic import will not lazy load the `component2` as it
should because of the index file.

Indeed, Webpack considered that both components come from the same `index.js`
module (with the id 693 in the bundle), so he grouped them into a unique bundle!

### Second case: no index file

I will now use a second entrypoint called `withoutIndex.js` where I import the
components using their full paths:

```js
// webpack.config.js

module.exports = {
  entry: {
    withoutIndex: './src/withoutIndex',
  },
};

// src/withoutIndex.js

import { component1 } from './components/component1';

document.body.innerText = component1;

window.doStuff = () =>
  import('./components/component2').then(
    ({ component2 }) => (document.body.innerText += component2)
  );
```

This time, Webpack will generate the 2 following bundles:

```js
// dist/438.js

(self.webpackChunkindex_tests = self.webpackChunkindex_tests || []).push([
  [438],
  {
    438: (n, o, e) => {
      'use strict';
      e.r(o), e.d(o, { component2: () => t });
      const t = '\ncomponent2\ncomponent2\ncomponent2\ncomponent2[...]';
    },
  },
]);

// dist/withoutIndex.js

(() => {
  'use strict';
  (document.body.innerText =
    '\ncomponent1\ncomponent1\ncomponent1\ncomponent1[...]'),
    (window.doStuff = () =>
      c
        .e(438)
        .then(c.bind(c, 438))
        .then(({ component2: n }) => (document.body.innerText += n)));
})();
```

In this case, 2 bundles have been generated:

- The main one, `dist/withIndex.js`, containing among other things, the
  `component1` and the content of our entry point.
- A second one, called `dist/438.js`, containing the `component2` that should be
  lazy loaded.

This time, Webpack split the code correctly and the `component2` will really be
lazy loaded 🎉

### Conclusion

To conclude, even if the usage of index files has become widespread lately, it
causes significant inconvenience **which makes it undesirable in my opinion**.

## Sources

- [Node.js require algorithm](https://nodejs.org/api/modules.html#modules_all_together)
- [Webpack documentation](https://webpack.js.org/concepts/)
