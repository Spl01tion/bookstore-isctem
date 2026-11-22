// Em context/AuthContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth tem de ser usado dentro de <AuthProvider>');
    return ctx;
};

export const AuthProvider = ({ children }) => {
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

    return (
        <AuthContext.Provider
            value={{ userToken, setUserToken, user, setUser, isLoading, setIsLoading, signIn, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );
};
