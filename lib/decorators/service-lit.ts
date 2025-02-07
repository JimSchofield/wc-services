import { ReactiveElement } from "lit";
import { service } from "../service";
import { Constructor } from "../types";

export function serviceLit(serviceClass: Constructor) {
  return function (target: ReactiveElement, propertyKey: string) {
    (target.constructor as typeof ReactiveElement).addInitializer(
      (element: ReactiveElement) => {
        // @ts-expect-error runtime assignment
        element[propertyKey] = service(element, serviceClass, () =>
          element.requestUpdate(),
        );
      },
    );
  };
}
