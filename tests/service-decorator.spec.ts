import { describe, test, expect, beforeEach, afterEach } from "vitest";
import { LitElement, html as litHtml } from "lit";
import ServiceProvider from "../lib/service-provider";
import { Service } from "../lib/base-service";
import { lazyService } from "../lib/service";
import { service } from "../lib/lit/service-decorator";
import { reactive } from "../lib/decorators/reactive";

class CounterService extends Service {
  @reactive count = 0;

  increment() {
    this.count++;
  }
}

// --- Vanilla web component using lazyService ---

class VanillaCounter extends HTMLElement {
  renderCount = 0;

  constructor() {
    super();
    lazyService(this, "counter", CounterService, () => this.update());
  }
  declare counter: CounterService;

  connectedCallback() {
    this.update();
  }

  update() {
    this.renderCount++;
    this.innerHTML = `<span class="count">${this.counter.count}</span>`;
  }
}

// --- Lit web component using @service decorator ---

class LitCounter extends LitElement {
  @service(CounterService)
  declare counter: CounterService;

  renderCount = 0;

  render() {
    this.renderCount++;
    return litHtml`<span class="count">${this.counter.count}</span>`;
  }
}

// Use unique tag names per test file to avoid duplicate registration
customElements.define("vanilla-counter-test", VanillaCounter);
customElements.define("lit-counter-test", LitCounter);

function waitForUpdate(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

describe("Vanilla web component with lazyService", () => {
  let provider: ServiceProvider;

  beforeEach(() => {
    provider = new ServiceProvider();
  });

  afterEach(() => {
    provider.destroy();
  });

  test("renders with service data and re-renders on notify", async () => {
    const el = document.createElement("vanilla-counter-test") as VanillaCounter;
    document.body.appendChild(el);

    try {
      expect(el.querySelector(".count")!.textContent).toBe("0");

      el.counter.increment();
      await waitForUpdate();

      expect(el.querySelector(".count")!.textContent).toBe("1");
      expect(el.renderCount).toBeGreaterThan(1);
    } finally {
      el.remove();
    }
  });

  test("multiple vanilla components share the same service instance", async () => {
    const el1 = document.createElement(
      "vanilla-counter-test",
    ) as VanillaCounter;
    const el2 = document.createElement(
      "vanilla-counter-test",
    ) as VanillaCounter;
    document.body.appendChild(el1);
    document.body.appendChild(el2);

    try {
      expect(el1.counter).toBe(el2.counter);

      el1.counter.increment();
      await waitForUpdate();

      expect(el1.querySelector(".count")!.textContent).toBe("1");
      expect(el2.querySelector(".count")!.textContent).toBe("1");
    } finally {
      el1.remove();
      el2.remove();
    }
  });
});

describe("Lit web component with @service decorator", () => {
  let provider: ServiceProvider;

  beforeEach(() => {
    provider = new ServiceProvider();
  });

  afterEach(() => {
    provider.destroy();
  });

  test("renders with service data and re-renders on notify", async () => {
    const el = document.createElement("lit-counter-test") as LitCounter;
    document.body.appendChild(el);

    try {
      await el.updateComplete;
      expect(el.shadowRoot!.querySelector(".count")!.textContent).toBe("0");

      el.counter.increment();
      await el.updateComplete;

      expect(el.shadowRoot!.querySelector(".count")!.textContent).toBe("1");
      expect(el.renderCount).toBeGreaterThan(1);
    } finally {
      el.remove();
    }
  });

  test("multiple Lit components share the same service instance", async () => {
    const el1 = document.createElement("lit-counter-test") as LitCounter;
    const el2 = document.createElement("lit-counter-test") as LitCounter;
    document.body.appendChild(el1);
    document.body.appendChild(el2);

    try {
      await el1.updateComplete;
      await el2.updateComplete;

      expect(el1.counter).toBe(el2.counter);

      el1.counter.increment();
      await el1.updateComplete;
      await el2.updateComplete;

      expect(el1.shadowRoot!.querySelector(".count")!.textContent).toBe("1");
      expect(el2.shadowRoot!.querySelector(".count")!.textContent).toBe("1");
    } finally {
      el1.remove();
      el2.remove();
    }
  });

  test("vanilla and Lit components share the same service instance", async () => {
    const vanilla = document.createElement(
      "vanilla-counter-test",
    ) as VanillaCounter;
    const lit = document.createElement("lit-counter-test") as LitCounter;
    document.body.appendChild(vanilla);
    document.body.appendChild(lit);

    try {
      await lit.updateComplete;

      expect(vanilla.counter).toBe(lit.counter);

      vanilla.counter.increment();
      await lit.updateComplete;
      await waitForUpdate();

      expect(vanilla.querySelector(".count")!.textContent).toBe("1");
      expect(lit.shadowRoot!.querySelector(".count")!.textContent).toBe("1");
    } finally {
      vanilla.remove();
      lit.remove();
    }
  });
});
