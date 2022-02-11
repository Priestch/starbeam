import { AbstractReactive, cell, Component, ReactiveDOM } from "starbeam";
import { Expects } from "../support/index.js";
import { test } from "../support/define.js";

test("a simple, static list", ({ universe, test }) => {
  const dom = universe.dom;
  const Name = NameComponent(dom);

  let state = {
    tom: cell("Tom"),
    yehuda: cell("Yehuda"),
    chirag: cell("Chirag"),
  };

  let names = AbstractReactive.from(Object.values(state));

  let result = test.render(
    dom.list(names, Name, (arg) => arg.current),
    Expects.dynamic.html("<p>Tom</p><p>Yehuda</p><p>Chirag</p>")
  );

  result.update(
    [state.yehuda, "@wycats"],
    Expects.html("<p>Tom</p><p>@wycats</p><p>Chirag</p>")
  );
});

test("a simple, dynamic list", ({ universe, test }) => {
  const dom = universe.dom;
  const Name = NameComponent(dom);

  let state = {
    tom: cell("Tom"),
    yehuda: cell("Yehuda"),
    chirag: cell("Chirag"),
  };

  let names = cell(Object.values(state));

  let result = test.render(
    dom.list(names, Name, (name) => name.current),
    Expects.dynamic.html("<p>Tom</p><p>Yehuda</p><p>Chirag</p>")
  );

  // [tom, yehuda, chirag] => [chirag, yehuda, tom]

  result.update(
    [names, [state.chirag, state.yehuda, state.tom]],
    Expects.html("<p>Chirag</p><p>Yehuda</p><p>Tom</p>")
  );

  result.update(
    [state.yehuda, "@wycats"],
    Expects.html("<p>Chirag</p><p>@wycats</p><p>Tom</p>")
  );
});

test("a list that can be empty", ({ universe, test }) => {
  const dom = universe.dom;
  const Name = NameComponent(dom);

  let state = {
    tom: cell("Tom"),
    yehuda: cell("Yehuda"),
    chirag: cell("Chirag"),
  };

  let names = cell([]);

  test
    .render(
      dom.list(names, Name, (name) => name.current),
      Expects.dynamic.html("<!---->")
    )
    .update([names, [state.tom]], Expects.html(`<p>Tom</p>`))
    .update(
      [names, [state.tom, state.yehuda]],
      Expects.html(`<p>Tom</p><p>Yehuda</p>`)
    )
    .update([names, []], Expects.html(`<!---->`))
    .update(
      [names, [state.tom, state.yehuda, state.chirag]],
      Expects.html("<p>Tom</p><p>Yehuda</p><p>Chirag</p>")
    )
    .update(
      [names, [state.chirag, state.yehuda, state.tom]],
      Expects.html("<p>Chirag</p><p>Yehuda</p><p>Tom</p>")
    )
    .update(
      [state.yehuda, "@wycats"],
      Expects.html("<p>Chirag</p><p>@wycats</p><p>Tom</p>")
    )
    .update([names, []], Expects.html("<!---->"));
});

test("a list that has sibling DOM nodes", ({ universe, test }) => {
  const dom = universe.dom;
  const Name = NameComponent(dom);

  let state = {
    tom: cell("Tom"),
    yehuda: cell("Yehuda"),
    chirag: cell("Chirag"),
  };

  let names = cell([]);

  test
    .render(
      dom
        .element(AbstractReactive.from("section"))
        .append(dom.list(names, Name, (name) => name.current))
        .append(dom.text(AbstractReactive.from("!")))
        .finalize(),
      Expects.dynamic.html("<section><!---->!</section>")
    )
    .update(
      [names, [state.tom]],
      Expects.html(`<section><p>Tom</p>!</section>`)
    )
    .update(
      [names, [state.tom, state.yehuda]],
      Expects.html(`<section><p>Tom</p><p>Yehuda</p>!</section>`)
    )
    .update([names, []], Expects.html(`<section><!---->!</section>`))
    .update(
      [names, [state.tom, state.yehuda, state.chirag]],
      Expects.html("<section><p>Tom</p><p>Yehuda</p><p>Chirag</p>!</section>")
    )
    .update(
      [names, [state.chirag, state.yehuda, state.tom]],
      Expects.html("<section><p>Chirag</p><p>Yehuda</p><p>Tom</p>!</section>")
    )
    .update(
      [state.yehuda, "@wycats"],
      Expects.html("<section><p>Chirag</p><p>@wycats</p><p>Tom</p>!</section>")
    )
    .update([names, []], Expects.html("<section><!---->!</section>"));
});

function NameComponent(dom: ReactiveDOM): Component<AbstractReactive<string>> {
  return function Name(name: AbstractReactive<string>) {
    return dom
      .element(AbstractReactive.from("p"))
      .append(dom.text(name))
      .finalize();
  };
}
