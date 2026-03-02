import type { Service } from "../base-service";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reactive(_target: Service, _propertyKey: PropertyKey): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
