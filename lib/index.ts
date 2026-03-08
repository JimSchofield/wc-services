import ServiceProvider from "./service-provider.ts";
import { Service } from "./base-service.ts";
import { getService, lazyService, setService } from "./service.ts";
import { getServiceProvider } from "./types.ts";
import { reactive } from "./decorators/reactive.ts";
export {
  getService,
  getServiceProvider,
  lazyService,
  reactive,
  Service,
  ServiceProvider,
  setService,
};
