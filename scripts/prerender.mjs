// Prerenderiza la home: mete el HTML de React dentro de #root para que el
// contenido se vea (y lo lea Google) antes de que cargue el JavaScript.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const React = require("react");
const ReactDOM = require("react-dom");
const { renderToString } = require("react-dom/server");

globalThis.React = React;
globalThis.ReactDOM = ReactDOM;
globalThis.__PRERENDER__ = true;
vm.runInThisContext(readFileSync("src/stefania-panzariu-site.js", "utf8"), { filename: "stefania-panzariu-site.js" });

const App = globalThis.__STEFANIA_APP__;
if (!App) throw new Error("No se encontró la App en el bundle");
const markup = renderToString(React.createElement(App));

const page = readFileSync("index.html", "utf8");
const re = /<div id="root">[\s\S]*?<\/div><!-- \/root -->|<div id="root"><\/div>/;
if (!re.test(page)) throw new Error("No se encontró <div id=\"root\"> en index.html");
writeFileSync("index.html", page.replace(re, () => `<div id="root">${markup}</div><!-- /root -->`));
console.log(`Prerender OK: ${(markup.length / 1024).toFixed(1)} KB de HTML en #root`);
