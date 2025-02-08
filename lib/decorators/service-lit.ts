import { ReactiveElement } from "lit";
import { service } from "../service";
import { ConstructorFrom } from "../types";
import { Service } from "../base-service";

export function serviceLit<T extends Service>(
  serviceClass: ConstructorFrom<T>,
) {
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
