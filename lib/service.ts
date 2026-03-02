/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service } from "./base-service";
import { ConstructorFrom, getServiceProvider } from "./types";
import { defineLazyProperty } from "./util/lazyProperty";

export function getService<T extends Service>(
  serviceClass: ConstructorFrom<T>,
): T {
  return getServiceProvider().getService(serviceClass) as T;
}

export function service<T extends Service>(
  host: any,
  serviceClass: ConstructorFrom<T>,
  notifyFn?: (serviceClass: Service) => void,
) {
  const instance = getService(serviceClass);

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
