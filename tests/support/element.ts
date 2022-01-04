import * as starbeam from "../../src/index";
import type { Expects } from "./expect/expect";

interface ShorthandAttribute {
  name: starbeam.AttributeName;
  value: string | null;
}

type TestAttribute =
  // { href: { prefix: Prefix.xlink, value: Reactive.static("<url>") } }
  | starbeam.BuildAttribute
  // { title: { value: "Chirag" } }
  // { href: { prefix: "xlink", value: "<url>" } } or
  // { href: { prefix: "xlink", value: Reactive.static("<url>") }
  | ShorthandAttribute
  // { title: "Chirag" } or { title: Reactive.static("Chirag") }
  | starbeam.IntoReactive<string | null>;

export function isIntoReactive(
  value: TestAttribute
): value is starbeam.IntoReactive<string | null> {
  if (starbeam.Reactive.is(value)) {
    return true;
  } else if (value === null || typeof value === "string") {
    return true;
  } else {
    return false;
  }
}

export function isReactiveAttribute(
  attribute: starbeam.BuildAttribute | ShorthandAttribute
): attribute is starbeam.BuildAttribute {
  return starbeam.Reactive.is(attribute.value);
}

export type TestChild = starbeam.ContentProgramNode | string;

export interface TestElementOptions {
  attributes?: Record<string, TestAttribute>;
  children?: readonly TestChild[];
}

export class ElementArgs {
  static normalize(
    universe: starbeam.Universe,
    options: TestElementArgs
  ): NormalizedTestElementArgs {
    return new ElementArgs(universe).#normalizeElementArgs(options);
  }

  constructor(readonly universe: starbeam.Universe) {}

  #normalizeElementArgs(args: TestElementArgs): NormalizedTestElementArgs {
    if (isNormalized(args)) {
      let [tagName, callback, expectation] = args;
      return { tagName, build: callback, expectation };
    } else {
      let [intoTagName, intoOptions, expectation] = args;

      let tagName = starbeam.Reactive.from(intoTagName);
      let build = this.#normalizeOptions(intoOptions);

      return { tagName, build, expectation };
    }
  }

  #normalizeOptions({
    attributes,
    children,
  }: TestElementOptions): BuilderCallback {
    let normalizedChildren =
      children?.map((c) => this.#normalizeChild(c)) ?? [];
    let normalizedAttributes = attributes
      ? Object.entries(attributes).map((a) => this.#normalizeAttribute(a))
      : [];

    return (b) => {
      for (let attribute of normalizedAttributes) {
        b.attribute(attribute);
      }

      for (let child of normalizedChildren) {
        b.append(child);
      }
    };
  }

  #normalizeChild(child: TestChild): starbeam.ContentProgramNode {
    if (typeof child === "string") {
      return this.universe.dom.text(this.universe.static(child));
    } else {
      return child;
    }
  }

  #normalizeAttribute([name, attribute]: [
    name: string,
    attribute: TestAttribute
  ]): starbeam.BuildAttribute {
    if (isIntoReactive(attribute)) {
      let value = starbeam.Reactive.from(attribute);
      return { name, value };
    } else if (isReactiveAttribute(attribute)) {
      return attribute;
    } else {
      let { name, value } = attribute;

      return {
        name,
        value: starbeam.Reactive.from(value),
      };
    }
  }
}

export type BuilderCallback = starbeam.ReactiveElementBuilderCallback;
export type TagName = starbeam.Reactive<string>;

type BuilderElementArgs = [
  tagName: TagName,
  callback: BuilderCallback,
  expectation: Expects
];

type ShorthandElementArgs = [
  tagName: starbeam.IntoReactive<string>,
  options: TestElementOptions,
  expectation: Expects
];

export type TestElementArgs = BuilderElementArgs | ShorthandElementArgs;

function isNormalized(args: TestElementArgs): args is BuilderElementArgs {
  return typeof args[1] === "function";
}

export type NormalizedTestElementArgs = {
  tagName: starbeam.Reactive<string>;
  build: BuilderCallback;
  expectation: Expects;
};
