// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reactive(target: any, property: PropertyKey): any {
  let val = target[property];

  return {
    get() {
      return val;
    },
    set(v: unknown) {
      val = v;
      target.notify();
    },
  };
}
