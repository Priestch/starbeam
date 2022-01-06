import type * as minimal from "@domtree/minimal";
import { COMPATIBLE_DOM } from "../dom/streaming/compatible-dom";
import { LazyDOM } from "../dom/streaming/token";
import {
  ElementHeadConstructor,
  TOKEN,
} from "../dom/streaming/tree-constructor";
import { Reactive } from "../reactive/core";
import type { BuildAttribute } from "./element";
import type {
  BuildMetadata,
  RenderedProgramNodeMetadata,
} from "./interfaces/program-node";

export class AttributeProgramNode {
  static create(attribute: BuildAttribute): AttributeProgramNode {
    return new AttributeProgramNode(attribute, {
      isStatic: Reactive.isStatic(attribute.value),
    });
  }

  #attribute: BuildAttribute;

  private constructor(
    attribute: BuildAttribute,
    readonly metadata: BuildMetadata
  ) {
    this.#attribute = attribute;
  }

  render(buffer: ElementHeadConstructor): RenderedAttribute | null {
    let value = this.#attribute.value;
    // let value = this.#attribute.value.current;
    let attr = buffer.attr(this.#attribute.name, value.current, TOKEN);
    return RenderedAttribute.create(LazyDOM.create(attr), value);
  }
}

export class RenderedAttribute {
  static create(
    attribute: LazyDOM<minimal.Attr>,
    value: Reactive<string | null>
  ) {
    return new RenderedAttribute(attribute, value, {
      isConstant: Reactive.isStatic(value),
    });
  }

  readonly #attribute: LazyDOM<minimal.Attr>;
  readonly #value: Reactive<string | null>;

  #metadata: RenderedProgramNodeMetadata;

  private constructor(
    attribute: LazyDOM<minimal.Attr>,
    value: Reactive<string | null>,
    metadata: RenderedProgramNodeMetadata
  ) {
    this.#attribute = attribute;
    this.#value = value;
    this.#metadata = metadata;
  }

  get metadata(): RenderedProgramNodeMetadata {
    return this.#metadata;
  }

  poll(inside: minimal.Element): void {
    COMPATIBLE_DOM.updateAttr(this.#attribute.get(inside), this.#value.current);
  }
}
