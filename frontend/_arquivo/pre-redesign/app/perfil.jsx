// Em app/perfil.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function PerfilScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{user?.name ?? 'Utilizador'}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      {user?.role && <Text style={styles.role}>Perfil: {user.role}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Terminar sessão</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#f4f4f8' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 16, color: '#555', marginTop: 6 },
  role: { fontSize: 14, color: '#6247AA', marginTop: 6 },
  button: { backgroundColor: '#6247AA', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 10, marginTop: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
