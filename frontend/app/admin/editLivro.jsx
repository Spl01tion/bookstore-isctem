// Em app/admin/editLivro.jsx — recebe o livro em JSON no parâmetro `livro`
import React, { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { updateLivro } from '../../api/api';
import { useToast } from '../../components/Toast';
import { LivroForm } from '../../components/LivroForm';
import { EmptyState } from '../../components/ui';

export default function EditLivroScreen() {
  const router = useRouter();
  const toast = useToast();
  const { livro: livroParam } = useLocalSearchParams();

  const livro = useMemo(() => {
    try {
      return livroParam ? JSON.parse(livroParam) : null;
    } catch {
      return null;
    }
  }, [livroParam]);

  if (!livro?._id) {
    return (
      <EmptyState
        icon='alert-circle-outline'
        title='Livro não encontrado'
        message='Abra a edição a partir da lista de livros.'
        actionLabel='Ir para a lista de livros'
        onAction={() => router.replace('/admin/livros')}
      />
    );
  }

  const handleSubmit = async (payload) => {
    const { data } = await updateLivro(livro._id, payload);
    toast.success(`"${data.titulo}" foi atualizado.`);
    router.back();
  };

  return <LivroForm initial={livro} submitLabel='Guardar alterações' onSubmit={handleSubmit} />;
}
