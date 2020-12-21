# `zzz-markdown`

> ZZZ rendered markdown

## Usage

````js
const z = require('zzz')
const markdown = require('zzz-markdown')
const darkOneTheme = require('zzz-markdown/dark-one')

const app = z(() => {
  return markdown`.${darkOneTheme}`(`
# Hello world!

Markdown rendered with ZZZ. Includes code highlighting also:

\`\`\`js
const hello = 'world!'
\`\`\`
`)

})

z.mount(app)
````

## API

### ```const component = markdown``(attrs, text)```

Render `text` as Markdown using a stateful component. This will cache the
result, but can be cached busted by keying the component. The result is wrapped
in a `div`, to make applying styles across the whole block easy.
The element can be changed by composition. `attrs` are applied to the `div`.

### `const className = require('zzz-markdown/dark-one')

Dark One theme as a scoped highlight.js theme. See the example above for usage

## Install

```sh
npm install zzz-markdown
```

## License

[ISC](LICENSE)
