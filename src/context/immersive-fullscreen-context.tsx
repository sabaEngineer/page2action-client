import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type Value = {
  immersive: boolean;
  setImmersive: (v: boolean) => void;
};

const ImmersiveFullscreenContext = createContext<Value | null>(null);

export function ImmersiveFullscreenProvider({ children }: { children: ReactNode }) {
  const [immersive, setImmersiveState] = useState(false);
  const setImmersive = useCallback((v: boolean) => setImmersiveState(v), []);
  const value = useMemo(() => ({ immersive, setImmersive }), [immersive, setImmersive]);

  return (
    <ImmersiveFullscreenContext.Provider value={value}>
      {children}
    </ImmersiveFullscreenContext.Provider>
  );
}

export function useImmersiveFullscreenOptional() {
  return useContext(ImmersiveFullscreenContext);
}
