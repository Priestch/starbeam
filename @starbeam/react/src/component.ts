import type { browser } from "@domtree/flavors";
import { Context, createContext, PropsWithChildren } from "react";
import { DomEnvironment, Root } from "starbeam";
import { useSSR } from "use-ssr";

export const STARBEAM = createContext(null) as unknown as Context<Root>;

export function Starbeam({
  document,
  children,
}: PropsWithChildren<{ document?: browser.Document }>) {
  let environment = inferEnvironment(document);
  let root = Root.environment(environment);

  // TODO: Error boundary
  return STARBEAM.Provider({ value: root, children });
}

function inferEnvironment(document?: browser.Document): DomEnvironment {
  const ssr = useSSR();

  if (document) {
    return DomEnvironment.window(document.defaultView as browser.Window);
  } else if (
    ssr.isBrowser ||
    // React's own heuristic
    (globalThis.document && globalThis.document.createElement)
  ) {
    return DomEnvironment.window(globalThis as browser.Window);
  } else {
    throw Error(
      `When using Starbeam outside of a browser-like environment, you must specify a 'document' prop, which must correpond to the document that React will render into`
    );
  }
}
