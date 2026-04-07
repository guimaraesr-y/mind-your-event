import { useState, useEffect, useCallback, useRef } from "react";
import {
  NotificationItem,
  PaginatedNotifications,
  UnreadCountResponse,
} from "@/types/notifications";

interface UseSWRState<T> {
  data: T | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error("Failed to fetch");
  }
  return response.json();
}

function useSWR<T>(key: string, options?: { refreshInterval?: number }): UseSWRState<T> & { mutate: () => void } {
  const [data, setData] = useState<T>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error>();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const mutate = useCallback(async () => {
    try {
      const result = await fetcher<T>(key);
      setData(result);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    }
  }, [key]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await fetcher<T>(key);
        if (mounted) {
          setData(result);
          setError(undefined);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    if (options?.refreshInterval) {
      intervalRef.current = setInterval(fetchData, options.refreshInterval);
    }

    return () => {
      mounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [key, options?.refreshInterval]);

  return { data, isLoading, error, mutate };
}

export function useUnreadCount() {
  const { data, isLoading, error, mutate } = useSWR<UnreadCountResponse>(
    "/api/notifications/unread-count",
    { refreshInterval: 30000 }
  );

  return {
    unreadCount: data?.unreadCount ?? 0,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}

export function useNotifications(cursor?: string, limit: number = 20) {
  const url = cursor
    ? `/api/notifications?cursor=${cursor}&limit=${limit}&includeRead=true`
    : `/api/notifications?limit=${limit}&includeRead=true`;

  const { data, isLoading, error, mutate } = useSWR<PaginatedNotifications>(url, {
    refreshInterval: 30000,
  });

  return {
    notifications: data?.items ?? [],
    nextCursor: data?.nextCursor ?? null,
    hasMore: data?.hasMore ?? false,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}