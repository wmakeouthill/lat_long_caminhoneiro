import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { estilos } from './TelaLogin.styles';
import { useTelaLogin } from './TelaLogin.hooks';
import type { TelaLoginProps } from './TelaLogin.types';

export function TelaLogin({ onLoginSucesso }: TelaLoginProps) {
  const { carregando, erro, loginDesabilitado, iniciarLoginGoogle } =
    useTelaLogin(onLoginSucesso);

  return (
    <View style={estilos.container}>
      <Text style={estilos.icone}>🚚</Text>
      <Text style={estilos.titulo}>Rastreamento</Text>
      <Text style={estilos.subtitulo}>
        Faça login para ativar o rastreamento da sua rota
      </Text>

      <TouchableOpacity
        style={estilos.botaoGoogle}
        onPress={iniciarLoginGoogle}
        disabled={loginDesabilitado || carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#333333" />
        ) : (
          <Text style={estilos.botaoGoogleTexto}>Entrar com Google</Text>
        )}
      </TouchableOpacity>

      {erro && <Text style={estilos.textoErro}>{erro}</Text>}
    </View>
  );
}
