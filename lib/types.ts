import ServiceProvider from "./service-provider";

export type ConstructorFrom<T> = new () => T;

export const SERVICE_PROVIDER_KEY = Symbol.for("service-provider");

export function getServiceProvider(): ServiceProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any)[SERVICE_PROVIDER_KEY];
}

declare global {
  interface Window {
    [SERVICE_PROVIDER_KEY]: ServiceProvider;
  }
}
