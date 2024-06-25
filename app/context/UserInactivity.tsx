import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({
  id: 'UserInactivity',
});

const LOCK_TIME = 3000;

interface UserInactivityProviderProps {
  children: React.ReactNode;
}

export const UserInactivityProvider: React.FC<UserInactivityProviderProps> = ({ children }) => {
  const appState = useRef<AppStateStatus>(AppState.currentState);
  // const router = useRouter(); // Asegúrate de que `useRouter` esté importado y definido correctamente

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'inactive') {
      router.push('/(modals)/white');
    } else {
      if (router.canGoBack()) {
        router.back();
      }
    }

    if (nextAppState === 'background') {
      recordStartTime();
    } else if (nextAppState === 'active' && appState.current.match(/background/)) {
      const elapsed = Date.now() - (storage.getNumber('startTime') || 0);

      if (elapsed >= LOCK_TIME) {
        router.push('/(modals)/lock');
      }
    }

    appState.current = nextAppState;
  };

  const recordStartTime = () => {
    storage.set('startTime', Date.now());
  };

  return <>{children}</>;
};
