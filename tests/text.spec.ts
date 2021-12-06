import { Expects, test } from "./support";

test("dynamic text", ({ timeline, test }) => {
  let cell = timeline.reactive("hello");
  let text = test.buildText(cell, Expects.dynamic);

  let result = test.render(text, Expects.dynamic);
  expect(result.node.nodeValue).toBe("hello");

  cell.update("goodbye");
  timeline.poll(result);

  expect(result.node.nodeValue).toBe("goodbye");
});

test("static text", ({ timeline, test }) => {
  let hello = timeline.static("hello");
  let text = test.buildText(hello, Expects.static);

  let { node } = test.render(text, Expects.static);
  expect(node.nodeValue).toBe("hello");
});
