import { makeService, Service } from "./base-service";
import { GetServiceEvent } from "./service";

export default class ServiceProvider {
  services = new Map<string, Service>();

  constructor() {
    window.addEventListener(
      "get-service",
      this.handleGetOrInit as EventListener,
    );

    console.log(this)
  }

  handleGetOrInit = (event: GetServiceEvent<Service>) => {
    const { service, name } = event;

    if (this.services.has(service.name)) {
      const serviceInstance = this.services.get(service.name);

      if (!serviceInstance) {
        throw new Error("Something went wrong with the map");
      }

      event.callback(serviceInstance);
    } else {
      const serviceInstance = makeService(name, service);

      if ("init" in serviceInstance && typeof serviceInstance.init === "function") {
        serviceInstance.init();
      }

      this.services.set(name, serviceInstance);

      event.callback(serviceInstance);
    }
  };

  /*
   * Intended for mocking situations
   */
  setService(name: string, service: Service) {
    if (this.services.has(name)) {
      throw new Error("Service already registered");
    } else {
      this.services.set(name, service);
    }
  }

  /*
   * Intended for resetting services in tests
   */
  clearAllServices() {
    Array.from(this.services.values()).forEach(({ destroy }) => destroy());

    this.services = new Map<string, Service>();
  }

  clearService(name: string) {
    if (!this.services.has(name)) {
      throw new Error("Service is not registered");
    } else {
      const instance = this.services.get(name);

      if (!instance) return;

      instance.destroy();

      this.services.delete(name);
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
