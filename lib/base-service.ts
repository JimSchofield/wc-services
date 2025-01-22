// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Klass = new (...args: any[]) => any;

export class BaseService {
  __subscribers: [HTMLElement, (service: InstanceType<Klass>) => void][] = [];

  notify() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.__subscribers.forEach(([_host, notifyFn]) => notifyFn(this));
  }
}
