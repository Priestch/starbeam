 
import { reactive } from "@starbeam/collections";
import { create } from "@starbeam/preact";
import type { JSX } from "preact/jsx-runtime";

import type { EventHandler } from "../../utils.js";

interface Person {
  name: string;
  location: string;
}

class Table<T> {
  #rows: Record<string, T> = reactive.object({}, "rows");
  #id = 0;

  constructor(readonly columns: string[]) {}

  get rows(): [string, T][] {
    return Object.entries(this.#rows);
  }

  append(row: T): void {
    this.#rows[`${this.#id++}`] = row;
  }

  delete(id: string): void {
    delete this.#rows[id];
  }
}

export default function Database(): JSX.Element {
  const people = create(() => new Table<Person>(["name", "location"]));

  const append: EventHandler<HTMLFormElement, "onSubmit"> = (event) => {
    event.preventDefault();
    people.append({ name: "Lorem Ipsum", location: "NYC" });
  };

  return (
    <>
      <form onSubmit={append}>
        <label>
          <button type="submit">append</button>
        </label>
      </form>

      <table>
        <thead>
          {people.rows.length === 0 ? null : (
            <tr>
              {people.columns.map((p) => (
                <th key={p}>{p}</th>
              ))}
              <th className="actions">&nbsp;</th>
            </tr>
          )}
        </thead>
        <tbody>
          {people.rows.map(([id, person]) => (
            <tr key={id}>
              <td>{person.name}</td>
              <td>{person.location}</td>
              <td className="actions">
                <button
                  onClick={() => {
                    people.delete(id);
                  }}
                >
                  ✂️
                </button>
              </td>
            </tr>
          ))}

          <tr className="summary" data-items={people.rows.length}>
            <td colSpan={3}>items: {people.rows.length}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
