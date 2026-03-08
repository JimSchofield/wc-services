import { Service } from "../base-service";
import { lazyService } from "../service";
import { ConstructorFrom, getServiceProvider } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceHost = HTMLElement & Record<string, any>;

export function service<T extends Service, H extends HTMLElement = HTMLElement>(
  serviceClass: ConstructorFrom<T>,
  updateFn?: (host: H) => void,
) {
  return function (target: H, propertyKey: string) {
    const proto = target as ServiceHost;

    const originalConnected = proto.connectedCallback;
    proto.connectedCallback = function (this: ServiceHost) {
      if (updateFn) {
        lazyService(this, propertyKey, serviceClass, () => updateFn(this as H));
      } else {
        // If host is a Service, lazyService auto-wires notify()
        lazyService(this, propertyKey, serviceClass);
      }
      // Access to trigger lazy initialization and subscription
      void this[propertyKey];

      if (originalConnected) {
        originalConnected.call(this);
      } else if (updateFn) {
        updateFn(this as H);
      }
    };

    const originalDisconnected = proto.disconnectedCallback;
    proto.disconnectedCallback = function (this: ServiceHost) {
      const instance = getServiceProvider().getService(serviceClass);
      instance.removeSubscriber(this);

      if (originalDisconnected) {
        originalDisconnected.call(this);
      }
    };
  };
}
