import React from "react";

type RefreshCallback = () => Promise<void>;

const RefreshContext = React.createContext<{
  readonly subscribe: (callback: RefreshCallback) => () => void;
  readonly hasSubscribers: boolean;
  readonly refresh: () => Promise<void>;
  readonly refreshing: boolean;
}>({
  subscribe: () => () => {},
  hasSubscribers: false,
  refresh: async () => {},
  refreshing: false,
});

export function RefreshContextProvider({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const subscribersRef = React.useRef<Set<RefreshCallback>>(new Set());
  const [subscriberCount, setSubscriberCount] = React.useState(0);
  const [refreshing, setRefreshing] = React.useState(false);

  const subscribe = React.useCallback((callback: RefreshCallback) => {
    subscribersRef.current.add(callback);
    setSubscriberCount((count) => count + 1);

    return () => {
      if (subscribersRef.current.delete(callback)) {
        setSubscriberCount((count) => Math.max(0, count - 1));
      }
    };
  }, []);

  const refresh = React.useCallback(async () => {
    const subscribers = Array.from(subscribersRef.current);

    if (subscribers.length === 0) {
      return;
    }

    setRefreshing(true);
    try {
      await Promise.all(subscribers.map((callback) => callback()));
    } finally {
      setRefreshing(false);
    }
  }, []);

  const value = React.useMemo(
    () => ({
      subscribe,
      refresh,
      refreshing,
      hasSubscribers: subscriberCount > 0,
    }),
    [refresh, refreshing, subscribe, subscriberCount]
  );

  return (
    <RefreshContext.Provider value={value}>{children}</RefreshContext.Provider>
  );
}

export function useRefreshContext() {
  return React.useContext(RefreshContext);
}

export function useListRefresh(callback?: RefreshCallback) {
  const { subscribe, refresh } = useRefreshContext();

  React.useEffect(() => {
    if (!callback) {
      return;
    }

    return subscribe(callback);
  }, [callback, subscribe]);

  return refresh;
}
