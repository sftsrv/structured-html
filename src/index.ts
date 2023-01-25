import type {
  BlockData,
  EditorContent,
  HeaderBlock,
  ListBlock,
  ParagraphBlock,
  QuoteBlock,
  RawBlock,
  SimpleImageBlock,
} from "./blocks";

import { exists } from "./utils";

type TagName = Uppercase<keyof HTMLElementTagNameMap>;

type HTMLStringContent = string;

type TransformResult = {
  element: Element;
  tagName: TagName;
  textContent?: string;
  htmlContent?: HTMLStringContent;
  children: TransformResult[];
  attrs: Record<string, string>;
};

/**
 * Transform HTML elements into parsed objects with some simplified content and structure
 * Based on https://stackoverflow.com/questions/12980648/map-html-to-json
 */
const transform = (el: Element): TransformResult => ({
  element: el,
  // tag names are strings internally but that's not very informative downstream
  tagName: el.tagName as TagName,
  textContent: el.textContent || undefined,
  htmlContent: el.innerHTML,
  children: Array.from(el.children).map(transform),
  attrs: Array.from(el.attributes).reduce(
    (acc, { name, value }) => ({ ...acc, [name]: value }),
    {}
  ),
});

type BlockDataArr<TBlockData extends BlockData = BlockData> = Array<
  BlockDataArr<TBlockData> | TBlockData
>;

type TagHandler<TTagData extends BlockData = BlockData> = (
  data: TransformResult
) => BlockDataArr<TTagData>;

type TagHandlerMap = Partial<Record<TagName, TagHandler>>;

const createParagraphs = (text: string): ParagraphBlock[] => [
  {
    type: "paragraph",
    data: {
      text,
    },
  },
];

const errorHandler = (transformed: TransformResult): BlockData[] => {
  console.warn("Failed to parse node", transformed);

  return [];
};

const containerHandler: TagHandler = (data) =>
  data.children.map((child) => {
    const handler = tagHandlers[child.tagName];
    if (!handler) {
      return errorHandler(child);
    }

    return handler(child);
  });

const paragraphHandler: TagHandler = (data) => {
  // this may not work very well for cases where we have mixes of data in the paragraph
  if (!data.textContent) {
    return containerHandler(data);
  }

  return createParagraphs(data.htmlContent || data.textContent);
};

const blockquoteHandler: TagHandler<QuoteBlock> = (data) =>
  data.textContent
    ? [
        {
          type: "quote",
          data: {
            text: data.textContent,
            alignment: "left",
          },
        },
      ]
    : [];

const imageHandler: TagHandler<SimpleImageBlock> = (data) =>
  data.attrs.src
    ? [
        {
          type: "image",
          data: {
            url: data.attrs.src,
            caption: data.attrs.alt || "",
            stretched: false,
            withBackground: false,
            withBorder: false,
          },
        },
      ]
    : [];

const headingHandler =
  (level: number): TagHandler<HeaderBlock> =>
  (data) =>
    data.htmlContent
      ? [
          {
            type: "header",
            data: {
              text: data.htmlContent,
              level,
            },
          },
        ]
      : [];

const listHandler =
  (style: "ordered" | "unordered"): TagHandler<ListBlock> =>
  (data) =>
    data.htmlContent
      ? [
          {
            type: "list",
            data: {
              style,
              items: data.children
                .map((child) => child.htmlContent)
                .filter(exists),
            },
          },
        ]
      : [];

const rawHandler: TagHandler<RawBlock> = (data) =>
  data.textContent
    ? [
        {
          type: "raw",
          data: {
            html: data.textContent,
          },
        },
      ]
    : [];

const tagHandlers: TagHandlerMap = {
  P: paragraphHandler,
  A: paragraphHandler,
  BLOCKQUOTE: blockquoteHandler,
  IMG: imageHandler,
  UL: listHandler("unordered"),
  OL: listHandler("ordered"),
  BODY: containerHandler,
  MAIN: containerHandler,
  ASIDE: containerHandler,
  SECTION: containerHandler,
  DIV: containerHandler,
  ARTICLE: containerHandler,
  SPAN: containerHandler,
  FIGURE: containerHandler,
  PICTURE: containerHandler,
  CODE: rawHandler,
  PRE: rawHandler,
  H1: headingHandler(1),
  H2: headingHandler(2),
  H3: headingHandler(3),
  H4: headingHandler(4),
  H5: headingHandler(5),
  H6: headingHandler(6),
};

export const convertHtmlToBlocks = (html: Element): EditorContent => {
  const transformed = transform(html);

  const baseHandler = tagHandlers[transformed.tagName];

  if (!baseHandler) {
    return errorHandler(transformed);
  }

  return baseHandler(transformed).flat(20) as EditorContent;
};
