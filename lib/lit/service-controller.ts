import { ReactiveController, ReactiveControllerHost } from "lit";
import { Service } from "../base-service";
import { getServiceInstance, lazyService } from "../service";
import { ConstructorFrom } from "../types";

export class ServiceController implements ReactiveController {
  host: ReactiveControllerHost;

  constructor(
    host: ReactiveControllerHost,
    property: PropertyKey,
    private serviceClass: ConstructorFrom<Service>,
  ) {
    (this.host = host).addController(this);

    lazyService(this.host, property, serviceClass, () => this.host.requestUpdate());
  }

  hostDisconnected(): void {
    const instance = getServiceInstance(this.serviceClass);

    instance.removeSubscriber(this);
  }
}
