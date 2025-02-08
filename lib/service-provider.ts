import { Service } from "./base-service";
import { GetServiceEvent } from "./service";
import { ConstructorFrom } from "./types";

export default class ServiceProvider {
  services = new Map<ConstructorFrom<Service>, Service>();

  constructor() {
    window.addEventListener(
      "get-service",
      this.handleGetOrInit as EventListener,
    );
  }

  handleGetOrInit = (event: GetServiceEvent<Service>) => {
    const klassDefinition = event.service;

    if (this.services.has(klassDefinition)) {
      const klassInstance = this.services.get(klassDefinition);

      if (!klassInstance) {
        throw new Error("Something went wrong with the map");
      }

      event.callback(klassInstance);
    } else {
      const instance = new klassDefinition();

      this.services.set(klassDefinition, instance);

      event.callback(instance);
    }
  };

  /*
   * Intended for mocking situations
   */
  setService(referenceClass: ConstructorFrom<Service>, instance: Service) {
    if (this.services.has(referenceClass)) {
      throw new Error("Service already registered");
    } else {
      this.services.set(referenceClass, instance);
    }
  }

  /*
   * Intended for resetting services in tests
   */
  clearAllServices() {
    Array.from(this.services.values()).forEach(({ destroy }) => destroy());

    this.services = new Map<ConstructorFrom<Service>, Service>();
  }

  clearService(referenceClass: ConstructorFrom<Service>) {
    if (!this.services.has(referenceClass)) {
      throw new Error("Service is not registered");
    } else {
      const instance = this.services.get(referenceClass);

      if (!instance) return;

      instance.destroy();

      this.services.delete(referenceClass);
    }
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
