import { useCallback, useRef, useSyncExternalStore } from "react";
import { getService } from "../service";
import { Service } from "../base-service";
import { ConstructorFrom } from "../types";

export function useService<T extends Service>(
  serviceClass: ConstructorFrom<T>,
): T {
  const instance = getService(serviceClass);
  const version = useRef(0);

  useSyncExternalStore(
    useCallback(
      (onStoreChange: () => void) => {
        return instance.addSubscriber(onStoreChange, () => {
          version.current++;
          onStoreChange();
        });
      },
      [instance],
    ),
    () => version.current,
  );

  return instance;
}
