/* eslint-disable @typescript-eslint/no-explicit-any */
import { Klass } from "./types";

type SubRecord = [any, (service: InstanceType<Klass>) => void];

export class Service {
  __subscribers: SubRecord[] = [];

  addSubscriber(sub: SubRecord) {
    this.__subscribers.push(sub);
  }

  removeSubscriber(host: any) {
    this.__subscribers = this.__subscribers.filter(
      ([h]) => h !== host,
    );
  }

  notify() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.__subscribers.forEach(([_host, notifyFn]) => {
      notifyFn(this);
    });
  }
}
