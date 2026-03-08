import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { createElement } from "react";
import { createRoot, Root } from "react-dom/client";
import { act } from "react";
import ServiceProvider from "../lib/service-provider";
import { Service } from "../lib/base-service";
import { reactive } from "../lib/decorators/reactive";
import { useService } from "../lib/react";

class TodoService extends Service {
  @reactive todos: string[] = [];

  addTodo(text: string) {
    this.todos = [...this.todos, text];
  }

  removeTodo(index: number) {
    this.todos = this.todos.filter((_, i) => i !== index);
  }

  clearTodos() {
    this.todos = [];
  }
}

describe("useService", () => {
  let provider: ServiceProvider;
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    provider = new ServiceProvider();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    root.unmount();
    container.remove();
    provider.destroy();
  });

  function renderAndGetText(el: React.ReactElement) {
    act(() => {
      root.render(el);
    });
    return container.textContent;
  }

  test("reads initial service state", () => {
    function App() {
      const svc = useService(TodoService);
      return createElement("div", null, `count:${svc.todos.length}`);
    }

    const text = renderAndGetText(createElement(App));
    expect(text).toBe("count:0");
  });

  test("re-renders when service state changes", async () => {
    function App() {
      const svc = useService(TodoService);
      return createElement(
        "div",
        null,
        svc.todos.map((t, i) => createElement("span", { key: i }, t)),
      );
    }

    renderAndGetText(createElement(App));
    expect(container.textContent).toBe("");

    const svc = provider.getService(TodoService);

    await act(async () => {
      svc.addTodo("first");
      // flush microtask for notification dedup
      await Promise.resolve();
    });

    expect(container.textContent).toBe("first");

    await act(async () => {
      svc.addTodo("second");
      await Promise.resolve();
    });

    expect(container.textContent).toBe("firstsecond");
  });

  test("re-renders on remove", async () => {
    function App() {
      const svc = useService(TodoService);
      return createElement("div", null, `count:${svc.todos.length}`);
    }

    renderAndGetText(createElement(App));

    const svc = provider.getService(TodoService);

    await act(async () => {
      svc.addTodo("a");
      await Promise.resolve();
    });

    await act(async () => {
      svc.addTodo("b");
      await Promise.resolve();
    });

    expect(container.textContent).toBe("count:2");

    await act(async () => {
      svc.removeTodo(0);
      await Promise.resolve();
    });

    expect(container.textContent).toBe("count:1");
  });

  test("re-renders on clear", async () => {
    function App() {
      const svc = useService(TodoService);
      return createElement("div", null, `count:${svc.todos.length}`);
    }

    renderAndGetText(createElement(App));

    const svc = provider.getService(TodoService);

    await act(async () => {
      svc.addTodo("a");
      await Promise.resolve();
    });

    await act(async () => {
      svc.addTodo("b");
      await Promise.resolve();
    });

    expect(container.textContent).toBe("count:2");

    await act(async () => {
      svc.clearTodos();
      await Promise.resolve();
    });

    expect(container.textContent).toBe("count:0");
  });

  test("unsubscribes on unmount", async () => {
    function App() {
      const svc = useService(TodoService);
      return createElement("div", null, `count:${svc.todos.length}`);
    }

    renderAndGetText(createElement(App));

    const svc = provider.getService(TodoService);
    expect(svc.__subscribers.size).toBe(1);

    act(() => {
      root.unmount();
    });

    expect(svc.__subscribers.size).toBe(0);
  });
});
