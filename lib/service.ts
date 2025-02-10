/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Service } from "./base-service";

export class GetServiceEvent<T> extends Event {
  name: string;
  service: T;
  callback: (instance: T & Service) => void;

  constructor(
    name: string,
    service: T,
    callback: (instance: T & Service) => void,
  ) {
    super("get-service", { bubbles: true });

    this.name = name;
    this.service = service;
    this.callback = callback;
  }
}

/*
 * connects to and returns service singleton
 */
export function service<T extends object>(
  host: any,
  name: string,
  service: T,
  notifyFn?: (service: T & Service) => void,
) {
  let serviceReference: T & Service;

  const serviceGetEvent = new GetServiceEvent(
    name,
    service,
    (instance: T & Service) => {
      serviceReference = instance;
    },
  );

  window.dispatchEvent(serviceGetEvent);

  // There may be particular cases where subscription is not desired yet,
  // so notifyFn is technically optional
  if (notifyFn) {
    // @ts-expect-error We are not worried about similar definitions from unrelated constructors
    serviceReference.addSubscriber(host, notifyFn);
  }

  // @ts-expect-error This will be set by event callback
  return serviceReference;
}
