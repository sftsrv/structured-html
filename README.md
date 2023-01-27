# HTML to EditorJS

A little library for converting HTML into a structured data format that is compatible with [EditorJS](https://github.com/codex-team/editor.js) so that HTML data can be passed into the editor

> Available on NPM as [html-to-editorjs](https://www.npmjs.com/package/html-to-editorjs)

## Usage

While intended for EditorJS, the library may be used for just transforming HTML content into structured/block-based content

The conversion from HTML can be done as follows:

```ts
import { convertHtmlToBlocks } from "html-to-editorjs";

// get some RAW HTML
const htmlText = "<p>hello world</p>";

// use the DOM to parse it from a string
const html = new DOMParser().parseFromString(htmlText, "text/html").body;

// the convertHtmlToBlocks function takes an HTML ELement
const blocks = convertHtmlToBlocks(html);
```

Using the above we can instantiate an `EditorJS` instance using the blocks like so::

```ts
const editor = new EditorJS({
  data: {
    // instantiate an editor using
    blocks,
  },
});
```
