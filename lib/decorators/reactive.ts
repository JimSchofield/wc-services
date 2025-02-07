/* eslint-disable @typescript-eslint/no-unused-vars */
import { Service } from "../base-service";

/* eslint-disable @typescript-eslint/no-explicit-any */
export function reactive(
  _target: Service,
  _propertyKey: PropertyKey,
): any {
  let val: any;

  return {
    get() {
      return val;
    },
    set(v: unknown) {
      val = v;
      this.notify();
    },
  };
}
