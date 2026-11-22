// Em components/ui.js — componentes visuais reutilizáveis
import React, { forwardRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing } from '../constants/theme';

// ---------- Botão ----------
const BUTTON_VARIANTS = {
  primary: { bg: colors.primary, fg: '#fff', border: colors.primary },
  secondary: { bg: colors.primaryLight, fg: colors.primary, border: colors.primaryLight },
  outline: { bg: 'transparent', fg: colors.primary, border: colors.primary },
  danger: { bg: colors.danger, fg: '#fff', border: colors.danger },
  ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
};

export function Button({ title, onPress, loading, disabled, variant = 'primary', icon, style, small }) {
  const v = BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.primary;
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole='button'
      accessibilityState={{ disabled: isDisabled, busy: !!loading }}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: v.bg, borderColor: v.border },
        pressed && { opacity: 0.85 },
        isDisabled && { opacity: 0.55 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={small ? 16 : 20} color={v.fg} />}
          <Text style={[styles.buttonText, small && styles.buttonTextSmall, { color: v.fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

// ---------- Campo de texto com label, ícone e erro ----------
export const TextField = forwardRef(function TextField(
  { label, error, icon, secureToggle, style, hint, ...inputProps },
  ref
) {
  const [hidden, setHidden] = useState(!!secureToggle);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.field, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          focused && { borderColor: colors.primary },
          error && { borderColor: colors.danger, backgroundColor: '#FFF8F8' },
        ]}
      >
        {icon && <Ionicons name={icon} size={20} color={error ? colors.danger : colors.textMuted} />}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.placeholder}
          {...inputProps}
          style={[styles.input, inputProps.multiline && styles.inputMultiline]}
          secureTextEntry={secureToggle ? hidden : inputProps.secureTextEntry}
          accessibilityLabel={inputProps.accessibilityLabel ?? label}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
        />
        {secureToggle && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityLabel={hidden ? 'Mostrar password' : 'Esconder password'}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
      {error ? (
        <View style={styles.fieldErrorRow}>
          <Ionicons name='alert-circle' size={14} color={colors.danger} />
          <Text style={styles.fieldError}>{error}</Text>
        </View>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
});

// ---------- Aviso de erro dentro de um formulário/ecrã ----------
export function InlineError({ message, onRetry, style }) {
  if (!message) return null;
  return (
    <View style={[styles.inlineError, style]} accessibilityRole='alert'>
      <Ionicons name='alert-circle' size={20} color={colors.danger} />
      <Text style={styles.inlineErrorText}>{message}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} hitSlop={8}>
          <Text style={styles.inlineErrorRetry}>Tentar de novo</Text>
        </Pressable>
      )}
    </View>
  );
}

// ---------- Estado de erro em ecrã inteiro ----------
export function ErrorState({ message, onRetry, title = 'Algo correu mal' }) {
  return (
    <View style={styles.state}>
      <View style={[styles.stateIcon, { backgroundColor: colors.dangerBg }]}>
        <Ionicons name='cloud-offline-outline' size={40} color={colors.danger} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateMessage}>{message}</Text>
      {onRetry && <Button title='Tentar novamente' icon='refresh' onPress={onRetry} style={{ marginTop: spacing.lg }} />}
    </View>
  );
}

// ---------- Estado vazio ----------
export function EmptyState({ icon = 'book-outline', title, message, actionLabel, onAction }) {
  return (
    <View style={styles.state}>
      <View style={[styles.stateIcon, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={40} color={colors.primary} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      {message && <Text style={styles.stateMessage}>{message}</Text>}
      {actionLabel && <Button title={actionLabel} variant='secondary' onPress={onAction} style={{ marginTop: spacing.lg }} />}
    </View>
  );
}

// ---------- Capa de livro com fallback ----------
export function BookCover({ uri, style, iconSize = 36 }) {
  const [failed, setFailed] = useState(false);
  if (!uri || failed) {
    return (
      <View style={[styles.coverFallback, style]}>
        <Ionicons name='book' size={iconSize} color={colors.primary} />
      </View>
    );
  }
  return <Image source={{ uri }} style={[styles.cover, style]} onError={() => setFailed(true)} resizeMode='cover' />;
}

// ---------- Avatar com iniciais ----------
export function Avatar({ name, size = 56 }) {
  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
}

// ---------- Chip (filtros, categorias, etiquetas) ----------
export function Chip({ label, active, onPress, icon, small }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityState={{ selected: !!active }}
      style={[styles.chip, small && styles.chipSmall, active && styles.chipActive]}
    >
      {icon && <Ionicons name={icon} size={14} color={active ? '#fff' : colors.primary} />}
      <Text style={[styles.chipText, small && { fontSize: 12 }, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label, color = colors.primary, bg = colors.primaryLight, icon }) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {icon && <Ionicons name={icon} size={12} color={color} />}
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 52,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  buttonSmall: { minHeight: 38, paddingHorizontal: spacing.md },
  buttonText: { fontSize: 16, fontWeight: '700' },
  buttonTextSmall: { fontSize: 14 },

  field: { marginBottom: spacing.lg },
  label: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, minHeight: 50, fontSize: 16, color: colors.text },
  inputMultiline: { minHeight: 110, textAlignVertical: 'top', paddingTop: spacing.md },
  fieldErrorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  fieldError: { color: colors.danger, fontSize: 13, flex: 1 },
  hint: { color: colors.textMuted, fontSize: 12, marginTop: 6 },

  inlineError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  inlineErrorText: { flex: 1, color: colors.danger, fontSize: 14, lineHeight: 20 },
  inlineErrorRetry: { color: colors.danger, fontWeight: '700', textDecorationLine: 'underline' },

  state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  stateIcon: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  stateTitle: { fontSize: 18, fontWeight: '700', color: colors.text, textAlign: 'center' },
  stateMessage: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },

  cover: { backgroundColor: colors.skeleton },
  coverFallback: { backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },

  avatar: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700' },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipSmall: { paddingVertical: 4, paddingHorizontal: 10 },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '600', fontSize: 14 },

  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 10, borderRadius: radius.pill },
  badgeText: { fontSize: 12, fontWeight: '700' },

  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: spacing.lg, ...shadow },
});
