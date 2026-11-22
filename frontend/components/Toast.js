// Em components/Toast.js — avisos rápidos no topo do ecrã (sucesso, erro, info)
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing } from '../constants/theme';

const ToastContext = createContext(null);

const VARIANTS = {
  success: { icon: 'checkmark-circle', color: colors.success, bg: colors.successBg },
  error: { icon: 'alert-circle', color: colors.danger, bg: colors.dangerBg },
  info: { icon: 'information-circle', color: colors.info, bg: colors.infoBg },
};

export function ToastProvider({ children }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => setToast(null));
  }, [opacity]);

  const show = useCallback(
    (message, type = 'info') => {
      clearTimeout(timer.current);
      setToast({ message, type });
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      // Erros ficam mais tempo visíveis para dar tempo de os ler
      timer.current = setTimeout(hide, type === 'error' ? 6000 : 3000);
    },
    [opacity, hide]
  );

  const api = useMemo(
    () => ({
      show,
      success: (m) => show(m, 'success'),
      error: (m) => show(m, 'error'),
      info: (m) => show(m, 'info'),
    }),
    [show]
  );

  const v = toast ? VARIANTS[toast.type] ?? VARIANTS.info : null;

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast && (
        <Animated.View
          pointerEvents='box-none'
          style={[styles.wrapper, { top: insets.top + spacing.sm, opacity }]}
        >
          <Pressable
            onPress={hide}
            accessibilityRole='alert'
            style={[styles.toast, { backgroundColor: v.bg, borderLeftColor: v.color }]}
          >
            <Ionicons name={v.icon} size={22} color={v.color} />
            <Text style={[styles.text, { color: colors.text }]}>{toast.message}</Text>
            <Ionicons name='close' size={18} color={colors.textMuted} />
          </Pressable>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast tem de ser usado dentro de <ToastProvider>');
  return ctx;
};

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', left: spacing.lg, right: spacing.lg, zIndex: 1000 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 4,
    ...shadow,
    elevation: 6,
  },
  text: { flex: 1, fontSize: 14, lineHeight: 20 },
});
