import { useEffect } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/store/auth.store';

// Registra a task de localização em background ANTES de qualquer navegação
import '@/features/tracking/tasks/localizacao-task';

const queryClient = new QueryClient();

function NavigationGuard() {
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const { accessToken, carregarTokenSalvo } = useAuthStore();

  useEffect(() => {
    carregarTokenSalvo();
  }, []);

  useEffect(() => {
    if (!navigationState?.key) return;

    const naTelaProtegida = segments[0] === 'rastreamento';

    if (!accessToken && naTelaProtegida) {
      router.replace('/');
    } else if (accessToken && !naTelaProtegida) {
      router.replace('/rastreamento');
    }
  }, [accessToken, segments, navigationState?.key]);

  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationGuard />
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
