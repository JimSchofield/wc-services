/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service } from "./base-service";
import { GetServiceEvent } from "./get-service-event";
import { ConstructorFrom } from "./types";
import { defineLazyProperty } from "./util/lazyProperty";

export function service<T extends Service>(
  host: any,
  serviceClass: ConstructorFrom<T>,
  notifyFn?: (serviceClass: Service) => void,
) {
  const instance = getServiceInstance(serviceClass);


  if (!notifyFn && host instanceof Service) {
    instance.addSubscriber(host, () => host.notify());
  }

  if (notifyFn) {
    instance.addSubscriber(host, notifyFn);
  }

  return instance;
}

export function lazyService<T extends Service>(
  host: any,
  propertyKey: PropertyKey,
  serviceClass: ConstructorFrom<T>,
  notifyFn?: (service: Service) => void,
) {
  // console.log(`init lazy register:`, host, " subscribing to ", service.name);
  defineLazyProperty(
    host,
    propertyKey,
    service.bind(null, host, serviceClass, notifyFn),
  );
}

export function getServiceInstance<T extends Service>(
  service: ConstructorFrom<T>,
) {
  let serviceReference: T;

  const serviceGetEvent = new GetServiceEvent(service, (reference: T) => {
    serviceReference = reference;
  });

  window.dispatchEvent(serviceGetEvent);

  // @ts-expect-error This will be set by event callback
  return serviceReference;
}
