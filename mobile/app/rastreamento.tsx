import { useRouter } from 'expo-router';
import { TelaRastreamento } from '@/features/tracking/components/TelaRastreamento';

export default function PaginaRastreamento() {
  const router = useRouter();

  return (
    <TelaRastreamento onLogout={() => router.replace('/')} />
  );
}
