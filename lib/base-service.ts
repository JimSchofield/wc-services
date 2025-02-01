/* eslint-disable @typescript-eslint/no-explicit-any */
import { Constructor } from "./types";

type SubRecord = [any, (service: InstanceType<Constructor>) => void];

export class Service {
  static notificationSet = new Set<any>();
  __subscribers: SubRecord[] = [];

  addSubscriber(sub: SubRecord) {
    this.__subscribers.push(sub);
  }

  removeSubscriber(host: any) {
    this.__subscribers = this.__subscribers.filter(
      ([h]) => h !== host,
    );
  }

  async notify() {
    this.__subscribers?.forEach(([host, notifyFn]) => {
      if (Service.notificationSet.has(host)) {
        return;
      }

      // console.log(`Notifying`, host, 'from', this);
      Service.notificationSet.add(host);
      notifyFn(this);
    });

    // Clears the notifcation set after all notifications have been dispatched
    await 0;
    Service.notificationSet.clear();
  }
}
