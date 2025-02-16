import { Service } from "./base-service";
import { ConstructorFrom } from "./types";

export class GetServiceEvent<T extends Service> extends Event {
  service: ConstructorFrom<T>;
  callback: (instance: T) => void;

  constructor(service: ConstructorFrom<T>, callback: (instance: T) => void) {
    super("get-service", { bubbles: true });

    this.service = service;
    this.callback = callback;
  }
}
