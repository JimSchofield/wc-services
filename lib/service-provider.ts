import { GetServiceEvent } from "./service";
import { Klass } from "./types";

const services = new Map<Klass, Klass>();

export default class ServiceProvider extends HTMLElement {
  constructor() {
    super();

    window.addEventListener(
      "get-service",
      this.handleGetOrInit as EventListener,
    );
  }

  disconnectedCallback() {
    /*
     * We attach to the window so we don't have to worry about consumers being connected
     * to the DOM.  They can reach services even in the constructor
     */
    window.removeEventListener(
      "get-service",
      this.handleGetOrInit as EventListener,
    );
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

  static {
    if (!customElements.get("service-provider")) {
      customElements.define("service-provider", this);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "service-provider": ServiceProvider;
  }
}
