// Em app/(tabs)/_layout.jsx
// A autenticação e os redirecionamentos são tratados em app/_layout.jsx.
import React from 'react';
import { Stack } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';

// ================================================================
// VARIÁVEL DE CONTROLO: true mostra o menu lateral com todas as telas;
// false usa navegação simples em pilha (sem menu).
// ================================================================
const IS_DEBUGGING = true;

const icon = (name) => ({ color, size }) => <Ionicons name={name} size={size} color={color} />;

export default function TabsLayout() {
  if (!IS_DEBUGGING) {
    return <Stack screenOptions={{ headerShown: false }} />;
  }

  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: '#6247AA' },
        headerTintColor: '#fff',
      }}
    >
      <Drawer.Screen
        name='index'
        options={{ drawerLabel: 'Início (App Principal)', title: 'App Principal', drawerIcon: icon('apps-outline') }}
      />
      <Drawer.Screen
        name='livros'
        options={{ drawerLabel: 'Livros', title: 'Livros', drawerIcon: icon('book-outline') }}
      />
      <Drawer.Screen
        name='favoritos'
        options={{ drawerLabel: 'Tela de Favoritos', title: 'Favoritos', drawerIcon: icon('heart-outline') }}
      />
      <Drawer.Screen
        name='createLivro'
        options={{ drawerLabel: 'Tela de Cadastro de Livro', title: 'Cadastro de Livro', drawerIcon: icon('add-circle-outline') }}
      />
      <Drawer.Screen
        name='signup'
        options={{ drawerLabel: 'Tela de Cadastro', title: 'Cadastro', drawerIcon: icon('person-add-outline') }}
      />
      <Drawer.Screen
        name='forgotPassword'
        options={{ drawerLabel: 'Tela de Recuperar Senha', title: 'Recuperar Senha', drawerIcon: icon('key-outline') }}
      />
    </Drawer>
  );
}
