import { Klass } from './types';

export class GetServiceEvent<T extends Klass> extends Event {
  service: T;
  config: ConstructorParameters<T>;
  callback: (instance: InstanceType<T>) => void;

  constructor(
    service: T,
    config: ConstructorParameters<T>[0],
    callback: (instance: InstanceType<T>) => void
  ) {
    super('get-service', { bubbles: true });

    this.service = service;
    this.callback = callback;
    this.config = config;
  }
}

/*
 * connects to and returns service singleton
 */
export function service<T extends Klass, U extends HTMLElement>(
  host: U,
  service: T,
  notifyFn?: (service: InstanceType<T>) => void,
  serviceConfig?: ConstructorParameters<T>
) {
  let serviceReference: InstanceType<T>;

  const serviceGetEvent = new GetServiceEvent(
    service,
    serviceConfig,
    (reference: InstanceType<T>) => {
      serviceReference = reference;
    }
  );

  host.dispatchEvent(serviceGetEvent);

  // @ts-expect-error This will be set by event callback
  (serviceReference as T).__subscribers.push([host, notifyFn]);

  // @ts-expect-error This will be set by event callback
  return serviceReference;
}

