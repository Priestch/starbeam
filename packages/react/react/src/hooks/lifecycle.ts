import { getFirst } from "@starbeam/core-utils";
import type { Lifecycle, RendererManager } from "@starbeam/renderer";
import { setup, use } from "@starbeam/resource";
import { service } from "@starbeam/service";
import {
  type Builder,
  useInstance,
  useLastRenderRef,
  useLifecycle,
} from "@starbeam/use-strict-lifecycle";

import { missingApp, ReactApp } from "../app.js";

/**
 * @internal
 *
 * The `buildLifecycle` function takes an internal builder from
 * `@starbeam/use-strict-lifecycle` and converts into the public API for
 * renderer lifecycles.
 */
export function buildLifecycle(
  builder: Builder<unknown>,
  app: ReactApp | null
): Lifecycle {
  return {
    get lifetime() {
      return builder;
    },

    service: (blueprint) => {
      if (app === null) missingApp("service()");

      return service(blueprint, {
        app: ReactApp.instance(app),
      });
    },
    use: (blueprint) => {
      const resource = use(blueprint);

      builder.on.idle(() => {
        setup(resource, { lifetime: builder });
      });

      return resource;
    },
    on: {
      idle: builder.on.idle,
      layout: builder.on.layout,
    },
  };
}

export const MANAGER: RendererManager<Builder<unknown>> = {
  toNative: (reactive) => reactive,
  getComponent: () => {
    return useLifecycle().render((builder) => builder);
  },
  setupValue: (_, create) => useInstance(create),
  setupRef: (_, prop) => getFirst(useLastRenderRef(prop)),

  on: {
    idle: (builder, handler): void => void builder.on.idle(handler),
    layout: (builder, handler): void => void builder.on.layout(handler),
  },
};
