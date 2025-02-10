/* eslint-disable @typescript-eslint/no-explicit-any */

type SubscribeCb = () => void;
type SubRecord = [any, SubscribeCb];

export interface Service {
  subscribers: Set<SubRecord>;
  name: string;
  addSubscriber(subscriber: any, notifyFn: SubscribeCb): () => void ;
  removeSubscriber(notifyFn: SubRecord): void,
  notify(service: Service): void,
  destroy(): void,
}


export function makeService<T extends object>(name: string, obj: T): T & Service{
  return Object.assign(obj, service, { name });
}

const notificationSet = new Set<any>();
export async function notify(service: object) {
  // object will be made a service, so need to duck type...

  if (!("subscribers" in service)) {
    return;
  }

  (service.subscribers as Set<SubRecord>).forEach(([subscriber, notifyFn]) => {
    if (notificationSet.has(subscriber)) {
      return;
    }

    // console.log(`Notifying`, host, 'from', this);
    notificationSet.add(subscriber);

    notifyFn();
  });

  // Clears the notifcation set after all notifications have been dispatched
  await 0;

  notificationSet.clear();
};

// name is assigned on creation
export const service: Omit<Service, "name"> = {
  subscribers: new Set<SubRecord>(),
  addSubscriber(subscriber: any, notifyFn: SubscribeCb) {
    const subRecord: SubRecord = [subscriber, notifyFn];

    this.subscribers.add(subRecord);

    return function (this: typeof service) {
      this.removeSubscriber(subRecord);
    };
  },

  notify,

  removeSubscriber(notifyFn: SubRecord) {
    this.subscribers.delete(notifyFn);
  },

  /*
   * Overwrite to include teardown instructions.  Only called when services are reset through
   * the service provider class
   */
  destroy() {},
};
