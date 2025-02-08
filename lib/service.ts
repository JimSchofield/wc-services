/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service } from "./base-service";
import { ConstructorFrom } from "./types";

export class GetServiceEvent<T extends Service> extends Event {
  service: ConstructorFrom<T>;
  callback: (instance: T) => void;

  constructor(service: ConstructorFrom<T>, callback: (instance: T) => void) {
    super("get-service", { bubbles: true });

    this.service = service;
    this.callback = callback;
  }
}

/*
 * connects to and returns service singleton
 */
export function service<T extends Service>(
  host: any,
  service: ConstructorFrom<T>,
  notifyFn?: (service: T) => void,
) {
  let serviceReference: T;

  const serviceGetEvent = new GetServiceEvent(service, (reference: T) => {
    serviceReference = reference;
  });

  window.dispatchEvent(serviceGetEvent);

  // There may be particular cases where subscription is not desired yet,
  // so notifyFn is technically optional
  // @ts-expect-error This will be set by event callback
  if (serviceReference instanceof Service && notifyFn) {
    // @ts-expect-error We are not worried about similar definitions from unrelated constructors
    serviceReference.addSubscriber(host, notifyFn);
  }

  // @ts-expect-error This will be set by event callback
  return serviceReference;
}
