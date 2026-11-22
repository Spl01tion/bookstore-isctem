// Em app/(debug)/_layout.jsx
import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';

export default function DebugDrawerLayout() {
  return (
    <Drawer screenOptions={{ drawerLabelStyle: { marginLeft: -20 } }}>
      <Drawer.Screen
        name='home' // Corresponde ao ficheiro app/(debug)/home.jsx
        options={{
          drawerLabel: 'Tela de Início (Tabs)',
          title: 'Início',
          drawerIcon: ({ color, size }) => (
            <Ionicons name='home-outline' size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name='login' // Corresponde ao ficheiro app/(debug)/login.jsx
        options={{
          drawerLabel: 'Tela de Login',
          title: 'Login',
          drawerIcon: ({ color, size }) => (
            <Ionicons name='log-in-outline' size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name='favoritos' // Corresponde ao ficheiro app/(debug)/favoritos.jsx
        options={{
          drawerLabel: 'Tela de Favoritos',
          title: 'Favoritos',
          drawerIcon: ({ color, size }) => (
            <Ionicons name='heart-outline' size={size} color={color} />
          ),
        }}
      />

      <Drawer.Screen
        name='forgotPassword'
        options={{ title: 'Recuperar Senha' }}
      />
      {/* Adicione aqui outros links, por exemplo, para a tela de filtros */}
    </Drawer>
  );
}
