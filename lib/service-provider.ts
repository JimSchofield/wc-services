import { Service } from "./base-service";
import { GetServiceEvent } from "./service";
import { Constructor } from "./types";

export default class ServiceProvider {
  services = new Map<Constructor, Service>();

  constructor() {
    window.addEventListener(
      "get-service",
      this.handleGetOrInit as EventListener,
    );
  }

  handleGetOrInit = (event: GetServiceEvent<Constructor>) => {
    const klassDefinition = event.service;

    if (this.services.has(klassDefinition)) {
      const klassInstance = this.services.get(klassDefinition);

      if (!klassInstance) {
        throw new Error("Something went wrong with the map");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      event.callback(klassInstance as any);
    } else {
      const instance = new klassDefinition();

      this.services.set(klassDefinition, instance);

      event.callback(instance);
    }
  };

  /*
   * Intended for mocking situations
   */
  setService(referenceClass: Constructor, instance: Service) {
    if (this.services.has(referenceClass)) {
      throw new Error("Class already registered");
    } else {
      this.services.set(referenceClass, instance);
    }
  }

  resetServices() {
    Array.from(this.services.values()).forEach(({ destroy }) => destroy());

    this.services = new Map<Constructor, Service>();
  }

  destroy() {
    /*
     * We attach to the window so we don't have to worry about consumers being connected
     * to the DOM.  They can reach services even in the constructor
     */
    window.removeEventListener(
      "get-service",
      this.handleGetOrInit as EventListener,
    );
  }
}

export class ServiceProviderComponent extends HTMLElement {
  serviceProvider: ServiceProvider;

  constructor() {
    super();

    this.serviceProvider = new ServiceProvider();
  }

  disconnectedCallback() {
    this.serviceProvider.destroy();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "service-provider": ServiceProviderComponent;
  }
}
