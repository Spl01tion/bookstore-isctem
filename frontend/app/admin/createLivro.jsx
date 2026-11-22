// Em app/admin/createLivro.jsx
import React from 'react';
import { useRouter } from 'expo-router';
import { createLivro } from '../../api/api';
import { useToast } from '../../components/Toast';
import { LivroForm } from '../../components/LivroForm';

export default function CreateLivroScreen() {
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (payload) => {
    const { data } = await createLivro(payload); // erros são mostrados pelo próprio formulário
    toast.success(`"${data.titulo}" foi adicionado ao catálogo.`);
    router.back();
  };

  return <LivroForm submitLabel='Adicionar livro' onSubmit={handleSubmit} />;
}
