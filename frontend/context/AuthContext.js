// Em context/AuthContext.js
import React, { createContext, useState, useContext, useCallback, useEffect, useMemo } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getUserProfile, setSessionExpiredHandler } from '../api/api';
import { useToast } from '../components/Toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth tem de ser usado dentro de <AuthProvider>');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const toast = useToast();
  const [userToken, setUserToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Guarda a sessão depois de login/registo
  const signIn = useCallback(async ({ accessToken, refreshToken, user }) => {
    await SecureStore.setItemAsync('userToken', accessToken);
    if (refreshToken) await SecureStore.setItemAsync('refreshToken', refreshToken);
    setUser(user ?? null);
    setUserToken(accessToken);
  }, []);

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('refreshToken');
    setUser(null);
    setUserToken(null);
  }, []);

  // Volta a pedir o perfil ao backend (ex.: depois de alterar favoritos)
  const refreshUser = useCallback(async () => {
    const response = await getUserProfile();
    setUser(response.data.user);
    return response.data.user;
  }, []);

  // Se o refresh token também expirar, termina a sessão e avisa o utilizador
  useEffect(() => {
    setSessionExpiredHandler(async () => {
      await signOut();
      toast.info('A sua sessão expirou. Inicie sessão novamente.');
    });
    return () => setSessionExpiredHandler(null);
  }, [signOut, toast]);

  const value = useMemo(
    () => ({
      userToken,
      setUserToken,
      user,
      setUser,
      isAdmin: user?.role === 'admin',
      isLoading,
      setIsLoading,
      signIn,
      signOut,
      refreshUser,
    }),
    [userToken, user, isLoading, signIn, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
