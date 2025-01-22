import { GetServiceEvent } from "./service";
import { Klass } from "./types";

const services = new Map<Klass, Klass>();

export default class LeighProvider extends HTMLElement {
  constructor() {
    super();

    this.attachListener();
  }

  attachListener() {
    this.addEventListener("get-service", this.handleGetOrInit as EventListener);
  }

  handleGetOrInit = (event: GetServiceEvent<Klass>) => {
    const klass = event.service;

    if (services.has(klass)) {
      const klassReference = services.get(klass);

      if (!klassReference) {
        throw new Error("Something went wrong with the map");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      event.callback(klassReference as any);
    } else {
      const instance = new klass(...(event.config ? event.config : []));

      services.set(klass, instance);

      event.callback(instance);
    }
  };

  createRenderRoot() {
    return this;
  }

  static register() {
    if (!customElements.get('leigh-')) {
      customElements.define('leigh-', this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "leigh-": LeighProvider;
  }
}
