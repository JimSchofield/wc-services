import { ReactiveController, ReactiveControllerHost } from "lit";
import { Service } from "../base-service";
import { service } from "../service";
import { ConstructorFrom } from "../types";

export class ServiceController implements ReactiveController {
  host: ReactiveControllerHost;

  service: Service;

  constructor(
    host: ReactiveControllerHost,
    serviceClass: ConstructorFrom<Service>,
  ) {
    (this.host = host).addController(this);

    const serviceInstance = service(this.host, serviceClass);

    serviceInstance.addSubscriber(this.host, () => this.host.requestUpdate());

    this.service = serviceInstance;
  }

  hostDisconnected(): void {
    this.service.removeSubscriber(this.host);
  }
}
