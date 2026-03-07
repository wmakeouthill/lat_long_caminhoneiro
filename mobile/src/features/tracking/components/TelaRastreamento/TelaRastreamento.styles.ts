import { StyleSheet } from 'react-native';

export const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  saudacao: {
    fontSize: 18,
    color: '#8888aa',
    marginBottom: 4,
  },
  nome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 48,
  },
  circuloStatus: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  circuloAtivo: {
    backgroundColor: '#16213e',
    borderWidth: 4,
    borderColor: '#4ecca3',
  },
  circuloInativo: {
    backgroundColor: '#16213e',
    borderWidth: 4,
    borderColor: '#444466',
  },
  textoStatus: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textoStatusAtivo: {
    color: '#4ecca3',
  },
  textoStatusInativo: {
    color: '#888899',
  },
  iconeStatus: {
    fontSize: 48,
    marginBottom: 8,
  },
  botaoToggle: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 50,
    marginBottom: 16,
    minWidth: 200,
    alignItems: 'center',
  },
  botaoAtivar: {
    backgroundColor: '#4ecca3',
  },
  botaoDesativar: {
    backgroundColor: '#ff6b6b',
  },
  botaoTexto: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  textoAtualizacao: {
    color: '#8888aa',
    fontSize: 13,
    marginBottom: 32,
  },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botaoLogout: {
    padding: 12,
  },
  botaoLogoutTexto: {
    color: '#555577',
    fontSize: 14,
  },
  botaoEngrenagem: {
    padding: 8,
  },
  iconeEngrenagem: {
    fontSize: 18,
    opacity: 0.5,
  },
  cadastroNomeContainer: {
    width: '100%',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  cadastroNomeTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  cadastroNomeDescricao: {
    fontSize: 13,
    color: '#8888aa',
    marginBottom: 16,
    textAlign: 'center',
  },
  cadastroNomeInput: {
    width: '100%',
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#0f3460',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#ffffff',
    marginBottom: 8,
  },
  cadastroNomeErro: {
    fontSize: 12,
    color: '#ef4444',
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  botaoSalvarNome: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#4ecca3',
    alignItems: 'center',
  },
  botaoSalvarNomeTexto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
});
