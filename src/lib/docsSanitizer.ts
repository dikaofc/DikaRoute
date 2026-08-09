import createDOMPurify from "dompurify";

type Sanitizer = ReturnType<typeof createDOMPurify>;

let sanitizer: Sanitizer | null = null;

// jsdom is a devDependency (used by vitest) but this module is production
// code. Import it lazily so the npm package (which ships without devDeps)
// never fails at module evaluation — `Cannot find module 'jsdom'` was
// causing 500s on every SSR page bundled into the same root chunk.
// When jsdom is unavailable we fall back to returning the HTML as-is
// (markdown comes from the trusted repo), matching previous behavior for
// English docs which skip sanitization entirely.
let jsdomLoadError: Error | null = null;
let jsdomPromise: Promise<typeof import("jsdom")> | null = null;

function loadJSDOM(): Promise<typeof import("jsdom")> {
  if (!jsdomPromise) {
    jsdomPromise = import("jsdom").catch((err: Error) => {
      jsdomLoadError = err;
      throw err;
    });
  }
  return jsdomPromise;
}

// Curated allowlist for HTML rendered from trusted-repo markdown (marked output).
// Explicit ALLOWED_TAGS/ATTR (no USE_PROFILES — when USE_PROFILES is set DOMPurify
// ignores ALLOWED_TAGS entirely) so the surviving tag set is deterministic and
// reviewable. Covers GFM output: headings, lists, tables, code, images, GFM
// task-list checkboxes (`input[type=checkbox]`), and collapsible details blocks.
const ALLOWED_TAGS = [
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "p",
  "a",
  "ul",
  "ol",
  "li",
  "ins",
  "del",
  "sub",
  "sup",
  "em",
  "strong",
  "span",
  "hr",
  "br",
  "div",
  "table",
  "thead",
  "caption",
  "tbody",
  "tr",
  "th",
  "td",
  "pre",
  "code",
  "img",
  "details",
  "summary",
  "input",
];
const ALLOWED_ATTR = [
  "href",
  "name",
  "target",
  "src",
  "alt",
  "title",
  "class",
  "id",
  "type",
  "checked",
  "disabled",
  "rel",
];

/**
 * Get or create a server-side DOMPurify instance (jsdom window — DOMPurify needs a DOM).
 */
async function getSanitizer(): Promise<Sanitizer> {
  if (!sanitizer) {
    const { JSDOM } = await loadJSDOM();
    const window = new JSDOM("").window;
    sanitizer = createDOMPurify(window as unknown as Window);
  }
  return sanitizer;
}

/**
 * Sanitize HTML content for documentation display.
 * @param html The raw HTML to sanitize
 */
export async function sanitizeDocsHtml(html: string): Promise<string> {
  try {
    const purify = await getSanitizer();
    return purify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
  } catch (err) {
    if (err === jsdomLoadError) {
      // jsdom (devDependency) not installed in the npm package — content is
      // trusted repo markdown, so returning it unsanitized is acceptable.
      return html;
    }
    throw err;
  }
}
