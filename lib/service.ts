/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service } from "./base-service";
import { Constructor } from "./types";

export class GetServiceEvent<T extends Constructor> extends Event {
  service: T;
  config: ConstructorParameters<T>;
  callback: (instance: InstanceType<T>) => void;

  constructor(
    service: T,
    config: ConstructorParameters<T>[0],
    callback: (instance: InstanceType<T>) => void,
  ) {
    super("get-service", { bubbles: true });

    this.service = service;
    this.callback = callback;
    this.config = config;
  }
}

/*
 * connects to and returns service singleton
 */
export function service<T extends Constructor>(
  host: any,
  service: T,
  notifyFn: (service: InstanceType<T>) => void,
  serviceConfig?: ConstructorParameters<T>,
) {
  let serviceReference: InstanceType<T>;

  const serviceGetEvent = new GetServiceEvent(
    service,
    serviceConfig,
    (reference: InstanceType<T>) => {
      serviceReference = reference;
    },
  );

  window.dispatchEvent(serviceGetEvent);

  // @ts-expect-error This will be set by event callback
  if (serviceReference instanceof Service) {
    serviceReference.addSubscriber([host, notifyFn]);
  }

  // @ts-expect-error This will be set by event callback
  return serviceReference;
}
