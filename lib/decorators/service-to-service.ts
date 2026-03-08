import { Service } from "../base-service";
import { setService as getServiceInstance } from "../service";
import { ConstructorFrom } from "../types";

export function service<T extends Service>(
  serviceClass: ConstructorFrom<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  return function (_target: Service, propertyKey: string) {
    const originalDestroy = _target.destroy;

    _target.destroy = function (this: Service) {
      // Only unsubscribe if the lazy property was accessed (resolved)
      const descriptor = Object.getOwnPropertyDescriptor(this, propertyKey);
      if (descriptor && "value" in descriptor) {
        (descriptor.value as Service).removeSubscriber(this);
      }

      originalDestroy.call(this);
    };

    // Return a descriptor that lazily resolves and subscribes on first access
    return {
      get(this: Service) {
        const result = getServiceInstance(this, serviceClass);

        Object.defineProperty(this, propertyKey, {
          value: result,
          writable: false,
          configurable: false,
        });

        return result;
      },
    };
  };
}
