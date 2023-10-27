import fse from "fs-extra";
import * as pageBuilderUtils from "./pageBuilderUtils.js";
import * as processor from "./processor.js";
import { minifyCSS } from "./processor.js";
import { TabbedPage } from "../types/types";

/**
 * Replace the template tag with the CSS source, or an empty string
 * @param currentPage - The current page as an Object
 * @param tmpl - The template as a string
 * @returns the processed template string
 */
function addCSS(currentPage: TabbedPage, tmpl: string) {
  return tmpl.replace(
    "%example-css-src%",
    currentPage.cssExampleSrc
      ? fse.readFileSync(currentPage.cssExampleSrc, "utf8")
      : ""
  );
}

/**
 * Replace the template tag with the preprocessed HTML source
 * @param currentPage - The current page as an Object
 * @param tmpl - The template as a string
 * @returns the processed template string
 */
function addHTML(currentPage: TabbedPage, tmpl: string) {
  const exampleCode = fse.readFileSync(currentPage.exampleCode, "utf8");
  const processedHTML = processor.preprocessHTML(exampleCode);
  return tmpl.replace("%example-code%", () => processedHTML);
}

/**
 * Replace the template tag with the JavaScript source, or an empty string
 * @param currentPage - The current page as an Object
 * @param tmpl - The template as a string
 * @returns the processed template string
 */
function addJS(currentPage: TabbedPage, tmpl: string) {
  tmpl = tmpl.replace(
    "%example-js-src%",
    currentPage.jsExampleSrc
      ? fse.readFileSync(currentPage.jsExampleSrc, "utf8")
      : ""
  );

  return tmpl;
}

/**
 * Adds optional hidden CSS to tabbed example.
 * Its primary use case is adding new font to the example, without displaying @font-face to the user
 * @param currentPage - The current page as an Object
 * @param tmpl - The template as a string
 * @returns the processed template string
 */
function addHiddenCSS(currentPage: TabbedPage, tmpl: string) {
  function getHiddenCSS(path: string) {
    const content = fse.readFileSync(path, "utf8");
    return minifyCSS(content, path);
  }
  if (currentPage.cssHiddenSrc) {
    const paths = Array.isArray(currentPage.cssHiddenSrc)
      ? currentPage.cssHiddenSrc
      : [currentPage.cssHiddenSrc];
    const hiddenCSS = paths.map(getHiddenCSS).join("");

    return tmpl.replace("%example-hidden-css-src%", hiddenCSS);
  } else {
    return tmpl.replace("%example-hidden-css-src%", "");
  }
}

/**
 * Builds and returns the HTML source for a tabbed example
 * @param tmpl - The template as a string
 * @param currentPage - The currentPage meta data as an Object
 * @returns The HTML for a tabbed example
 */
export function buildTabbedExample(currentPage: TabbedPage, tmpl: string) {
  tmpl = pageBuilderUtils.setMainTitle(currentPage, tmpl);
  tmpl = pageBuilderUtils.setEditorHeight(currentPage, tmpl);
  tmpl = pageBuilderUtils.setActiveTabs(currentPage, tmpl);
  tmpl = pageBuilderUtils.setDefaultTab(currentPage, tmpl);
  tmpl = pageBuilderUtils.setConsoleState(currentPage, tmpl);
  tmpl = pageBuilderUtils.setEditorType(currentPage, tmpl);

  // add example code
  tmpl = addCSS(currentPage, tmpl);
  tmpl = addHTML(currentPage, tmpl);
  tmpl = addJS(currentPage, tmpl);
  // add hidden example-dependent CSS
  tmpl = addHiddenCSS(currentPage, tmpl);
  return tmpl;
}
