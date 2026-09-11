import { useEffect } from 'react';
import {
  activateKeepAwake,
  deactivateKeepAwake,
} from '@sayem314/react-native-keep-awake';

/** Prevents the device screen from dimming or locking while `active` is true. */
export function useKeepAwake(active = true) {
  useEffect(() => {
    if (!active) return;

    activateKeepAwake();
    return () => {
      deactivateKeepAwake();
    };
  }, [active]);
}
