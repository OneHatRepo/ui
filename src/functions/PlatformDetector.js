// Taken from https://github.com/flexdinesh/browser-or-node/blob/master/src/index.js

const isBrowser =
  typeof window !== "undefined" && typeof window.document !== "undefined";

const isNode =
  typeof process !== "undefined" &&
  process.versions != null &&
  process.versions.node != null;

const isWebWorker =
  typeof self === "object" &&
  self.constructor &&
  self.constructor.name === "DedicatedWorkerGlobalScope";

/**
 * @see https://github.com/jsdom/jsdom/releases/tag/12.0.0
 * @see https://github.com/jsdom/jsdom/issues/1537
 */
const isJsDom =
  (typeof window !== "undefined" && window.name === "nodejs") ||
  (typeof navigator !== "undefined" &&
    (navigator.userAgent?.includes("Node.js") ||
      navigator.userAgent?.includes("jsdom")));

const isDeno =
	typeof Deno !== "undefined" && Deno.version?.deno;

export { isBrowser, isWebWorker, isNode, isJsDom, isDeno };