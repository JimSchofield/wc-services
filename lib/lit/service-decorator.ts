import { ReactiveElement } from "lit";
import { ConstructorFrom } from "../types";
import { Service } from "../base-service";
import { ServiceController } from "./service-controller";

export function service<T extends Service>(serviceClass: ConstructorFrom<T>) {
  return function (target: ReactiveElement, propertyKey: string) {
    (target.constructor as typeof ReactiveElement).addInitializer(
      (element: ReactiveElement) => {
        new ServiceController(element, propertyKey, serviceClass);
      },
    );
  };
}
