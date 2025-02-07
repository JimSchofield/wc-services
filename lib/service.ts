/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service } from "./base-service";
import { Constructor } from "./types";

export class GetServiceEvent<T extends Constructor> extends Event {
  service: T;
  callback: (instance: InstanceType<T>) => void;

  constructor(
    service: T,
    callback: (instance: InstanceType<T>) => void,
  ) {
    super("get-service", { bubbles: true });

    this.service = service;
    this.callback = callback;
  }
}

/*
 * connects to and returns service singleton
 */
export function service<T extends Constructor>(
  host: any,
  service: T,
  notifyFn?: (service: InstanceType<T>) => void,
) {
  let serviceReference: InstanceType<T>;

  const serviceGetEvent = new GetServiceEvent(
    service,
    (reference: InstanceType<T>) => {
      serviceReference = reference;
    },
  );

  window.dispatchEvent(serviceGetEvent);

  // There may be particular cases where subscription is not desired yet,
  // so notifyFn is technically optional
  // @ts-expect-error This will be set by event callback
  if (serviceReference instanceof Service && notifyFn) {
    serviceReference.addSubscriber(host, notifyFn);
  }

  // @ts-expect-error This will be set by event callback
  return serviceReference;
}
