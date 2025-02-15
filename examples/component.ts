import { render, Renderable } from "lighterhtml";

export default abstract class Component extends HTMLElement {
  getMountPoint(): HTMLElement | ShadowRoot {
    return this;
  }

  connectedCallback() {
    if ("render" in this) {
      this.render = render.bind(
        null,
        this.getMountPoint(),
        (this.render as () => Renderable).bind(this),
      );
    }
    // @ts-expect-error live value
    this.render();
  }

  notify() {
    if (!("render" in this)) {
      throw new Error(
        `Component is missing render in ${this.constructor.name}`,
      );
    }
    (this.render as () => Renderable)();
  }
}
