import ServiceProvider, {
  ServiceProviderComponent,
} from "./service-provider.ts";
import { Service } from "./base-service.ts";
import { service } from "./service.ts";
import { reactive } from "./decorators/reactive.ts";
import { serviceLit } from "./decorators/service-lit.ts";

export {
  Service,
  ServiceProvider,
  ServiceProviderComponent,
  service,
  reactive,
  serviceLit,
};
