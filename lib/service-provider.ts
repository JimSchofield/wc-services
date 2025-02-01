import { GetServiceEvent } from "./service";
import { Constructor } from "./types";

const services = new Map<Constructor, Constructor>();

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

  handleGetOrInit = (event: GetServiceEvent<Constructor>) => {
    const klassDefinition = event.service;

    if (services.has(klassDefinition)) {
      const klassInstance = services.get(klassDefinition);

      if (!klassInstance) {
        throw new Error("Something went wrong with the map");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      event.callback(klassInstance as any);
    } else {
      const instance = new klassDefinition(...(event.config ? event.config : []));

      services.set(klassDefinition, instance);

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
