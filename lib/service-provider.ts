import { Service } from "./base-service";
import { ConstructorFrom, SERVICE_PROVIDER_KEY } from "./types";

export default class ServiceProvider {
  services = new Map<ConstructorFrom<Service>, Service>();

  static setup() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = (window as any)[SERVICE_PROVIDER_KEY];
    if (existing) return existing as ServiceProvider;
    return new ServiceProvider();
  }

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any)[SERVICE_PROVIDER_KEY] = this;
  }

  getService(serviceClass: ConstructorFrom<Service>) {
    if (this.services.has(serviceClass)) {
      const classInstance = this.services.get(serviceClass);

      if (!classInstance) {
        throw new Error("Something went wrong with the map");
      }

      return classInstance;
    } else {
      const instance = new serviceClass();

      this.services.set(serviceClass, instance);

      return instance;
    }
  }

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
  destroyAllServices() {
    for (const service of this.services.values()) {
      service.destroy();
    }

    this.services = new Map<ConstructorFrom<Service>, Service>();
  }

  destroyService(referenceClass: ConstructorFrom<Service>) {
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
    this.destroyAllServices();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any)[SERVICE_PROVIDER_KEY];
  }
}