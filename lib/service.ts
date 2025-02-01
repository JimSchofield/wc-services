import { Service } from "./base-service";
import { Klass } from "./types";

export class GetServiceEvent<T extends Klass> extends Event {
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
 * A default call would be to a `render` function
 * For lit, this would be requestUpdate
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Renderable = { render?(): any };

/*
 * connects to and returns service singleton
 */
export function service<T extends Klass, U extends HTMLElement & Renderable>(
  host: U,
  service: T,
  // Default render/update command for Dewdrop
  notifyFn: (service: InstanceType<T>) => void = () => host.render?.(),
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
