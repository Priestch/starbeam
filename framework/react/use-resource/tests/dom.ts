import {
  type FunctionComponent,
  type ReactElement,
  type ReactHTML,
  type ReactNode,
  createElement,
  Fragment,
  isValidElement,
} from "react";

type PropsFor<E> = E extends keyof ReactHTML
  ? ReactHTML[E] extends (props?: infer Props) => any
    ? Props
    : never
  : never;

// ReactHTML[E]> extends          (props?: ClassAttributes<T> & P | null, ...children: ReactNode[]) => DetailedReactHTMLElement<P, T> ? 1 : 0;

// typeof createElement extends (
//   type: E,
//   props: infer Props,
//   ...args: any[]
// ) => any
//   ? Props
//   : {};

type ReactProxyFunction<E extends keyof ReactHTML> = ReactHTML[E];

type HtmlProxyFunction<E extends keyof ReactHTML> = ReactProxyFunction<E> &
  ((...children: ReactNode[]) => ReactElement);

// ReactElement | ReactFragment | ReactPortal | boolean | null | string | null | undefined;

function isReactNode(value: unknown): value is ReactNode {
  switch (typeof value) {
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return true;
    case "object": {
      if (value === null) {
        return true;
      } else if (isValidElement(value)) {
        return true;
      }
    }
  }

  return false;
}

type HtmlProxy = {
  [P in keyof ReactHTML]: HtmlProxyFunction<P>;
};

function render<P>(
  component: FunctionComponent<P>,
  props: P,
  ...children: ReactNode[]
): ReactElement;
function render(
  component: FunctionComponent<{}>,
  ...children: ReactNode[]
): ReactElement;
function render(...args: any): ReactElement {
  return createElement(...(args as Parameters<typeof createElement>));
}

export const react = {
  fragment(...children: ReactNode[]): ReactElement {
    return createElement(Fragment, null, ...children);
  },

  render,
} as const;

export const html: HtmlProxy = new Proxy(() => {}, {
  get: (target, property, receiver) => {
    if (typeof property === "symbol") {
      return Reflect.get(target, property);
    }

    return (...args: any[]) => {
      if (isReactNode(args[0])) {
        return createElement(property, null, ...args);
      } else {
        const [props, ...children] = args;
        return createElement(property, props, children);
      }
    };
  },

  apply: (target, receiver, args) => {},
}) as unknown as HtmlProxy;

export function el(tag: string | FunctionComponent<{}>, children: ReactNode[]) {
  return createElement(tag, null, ...children);
}
