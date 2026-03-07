import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { estilos } from './TelaRastreamento.styles';
import { useTelaRastreamento } from './TelaRastreamento.hooks';
import type { TelaRastreamentoProps } from './TelaRastreamento.types';

export function TelaRastreamento({ onLogout }: TelaRastreamentoProps) {
  const {
    rastreando,
    carregando,
    ultimaAtualizacao,
    caminhoneiro,
    alternarRastreamento,
    fazerLogout,
    inputNome,
    setInputNome,
    erroNome,
    salvandoNome,
    salvarNome,
  } = useTelaRastreamento();

  async function handleLogout() {
    await fazerLogout();
    onLogout();
  }

  return (
    <View style={estilos.container}>
      <Text style={estilos.saudacao}>Olá,</Text>
      <Text style={estilos.nome}>{caminhoneiro?.nome?.split(' ')[0] ?? 'Motorista'}</Text>

      <View style={estilos.cadastroNomeContainer}>
          <Text style={estilos.cadastroNomeTitulo}>Seu nome</Text>
          <Text style={estilos.cadastroNomeDescricao}>Aparece no painel do gestor.</Text>
          <TextInput
            style={estilos.cadastroNomeInput}
            placeholder="Seu nome"
            placeholderTextColor="#555577"
            value={inputNome}
            onChangeText={(t) => { setInputNome(t); }}
            onSubmitEditing={salvarNome}
            returnKeyType="done"
            autoFocus
          />
          {erroNome ? <Text style={estilos.cadastroNomeErro}>{erroNome}</Text> : null}
          <TouchableOpacity
            style={estilos.botaoSalvarNome}
            onPress={salvarNome}
            disabled={salvandoNome || !inputNome.trim()}
          >
            {salvandoNome ? (
              <ActivityIndicator color="#1a1a2e" />
            ) : (
              <Text style={estilos.botaoSalvarNomeTexto}>Salvar Nome</Text>
            )}
          </TouchableOpacity>
      </View>

      <View style={[estilos.circuloStatus, rastreando ? estilos.circuloAtivo : estilos.circuloInativo]}>
        <Text style={estilos.iconeStatus}>{rastreando ? '📡' : '📍'}</Text>
        <Text style={[estilos.textoStatus, rastreando ? estilos.textoStatusAtivo : estilos.textoStatusInativo]}>
          {rastreando ? 'ATIVO' : 'INATIVO'}
        </Text>
      </View>

      <TouchableOpacity
        style={[estilos.botaoToggle, rastreando ? estilos.botaoDesativar : estilos.botaoAtivar]}
        onPress={alternarRastreamento}
        disabled={carregando}
      >
        {carregando ? (
          <ActivityIndicator color="#1a1a2e" />
        ) : (
          <Text style={estilos.botaoTexto}>
            {rastreando ? 'Desativar Rastreamento' : 'Ativar Rastreamento'}
          </Text>
        )}
      </TouchableOpacity>

      {ultimaAtualizacao && (
        <Text style={estilos.textoAtualizacao}>
          Última atualização: {ultimaAtualizacao.toLocaleTimeString('pt-BR')}
        </Text>
      )}

      <TouchableOpacity style={estilos.botaoLogout} onPress={handleLogout}>
        <Text style={estilos.botaoLogoutTexto}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}
