import { useRouter } from 'expo-router';
import { TelaLogin } from '@/features/auth/components/TelaLogin';

export default function PaginaLogin() {
  const router = useRouter();

  return (
    <TelaLogin onLoginSucesso={() => router.replace('/rastreamento')} />
  );
}
