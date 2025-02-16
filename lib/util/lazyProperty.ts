// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defineLazyProperty(host: any, propertyKey: PropertyKey, fn: () => any) {

  Object.defineProperty(host, propertyKey, {
    get() {
      const result = fn();

      Object.defineProperty(this, propertyKey, {
        value: result,
        writable: false,
        configurable: false,
      });

      return result;
    },
    configurable: true,
    enumerable: true,
  });
}
