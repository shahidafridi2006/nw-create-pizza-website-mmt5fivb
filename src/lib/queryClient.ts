import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

// Query keys for consistent cache management
export const queryKeys = {
  pizzas: {
    all: ['pizzas'] as const,
    list: () => [...queryKeys.pizzas.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.pizzas.all, 'detail', id] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: () => [...queryKeys.orders.all, 'list'] as const,
    userOrders: (userId: string) => [...queryKeys.orders.all, 'user', userId] as const,
    detail: (id: string) => [...queryKeys.orders.all, 'detail', id] as const,
  },
  profile: {
    detail: (userId: string) => ['profile', userId] as const,
  },
}