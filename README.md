# Structured HTML

A little library for simplifying and transforming HTML into structured data

## Usage

While designed around the [EditorJS](https://github.com/codex-team/editor.js) API, the library may be used for just transforming HTML content into structured/block-based content for a variety of purposes

The conversion from HTML can be done as follows:

```ts
import { convertHtmlToBlocks } from "@sftsrv/structured-html";

// get some RAW HTML
const htmlText = "<p>hello world</p>";

// use the DOM to parse it from a string
const html = new DOMParser().parseFromString(htmlText, "text/html").body;

// the convertHtmlToBlocks function takes an HTML ELement and returns the structured HTML content
const blocks = convertHtmlToBlocks(html);
```
