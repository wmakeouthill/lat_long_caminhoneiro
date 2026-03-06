import { StyleSheet } from 'react-native';

export const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: '#8888aa',
    marginBottom: 48,
    textAlign: 'center',
  },
  botaoGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 12,
  },
  botaoGoogleTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  textoErro: {
    color: '#ff6b6b',
    marginTop: 16,
    textAlign: 'center',
  },
  icone: {
    fontSize: 32,
    marginBottom: 16,
  },
});
