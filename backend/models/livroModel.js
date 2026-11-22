import mongoose from "mongoose";
import { slugify } from "../utils/slugify.js";

const livroSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    minlength: [1, 'Título deve ter pelo menos 1 caractere'],
    maxlength: [200, 'Título deve ter no máximo 200 caracteres']
  },
  // Capa do livro. Os livros antigos na BD usam `imagens` (array);
  // a resposta JSON expõe sempre `imagem_uri` (ver toJSON abaixo).
  imagem_uri: { type: String, trim: true },
  imagens: [{ type: String }],
  download_link: {
    type: String,
    trim: true,
    default: null
  },
  autores: {
    type: String,
    required: [true, 'Autor é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome do autor deve ter no máximo 100 caracteres']
  },
  descricao: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    trim: true,
    minlength: [10, 'Descrição deve ter pelo menos 10 caracteres'],
    maxlength: [2000, 'Descrição deve ter no máximo 2000 caracteres']
  },
  categoria: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: true
  }],
  publiData: {
    type: Date,
    required: [true, 'Data de publicação é obrigatória']
  },
  editora: {
    type: String,
    trim: true,
    maxlength: [100, 'Nome da editora deve ter no máximo 100 caracteres']
  },
  lingua: {
    type: String,
    required: [true, 'Idioma é obrigatório'],
    default: 'pt-br'
  },
  pag: {
    type: Number,
    min: [1, 'Número de páginas deve ser positivo']
  },
  // A coleção tem um índice único em `slug`: tem de ser sempre preenchido
  slug: { type: String, trim: true },
});

// Gera o slug no formato usado pelos dados existentes: "terra-sonambula-65bf8d"
livroSchema.pre('validate', function () {
  if (!this.slug) this.slug = `${slugify(this.titulo)}-${this._id.toString().slice(-6)}`;
});

livroSchema.set('toJSON', {
  transform: (_doc, ret) => {
    if (!ret.imagem_uri && Array.isArray(ret.imagens) && ret.imagens.length > 0) {
      ret.imagem_uri = ret.imagens[0];
    }
    delete ret.__v;
    return ret;
  }
});

const Livro = mongoose.model("Livro", livroSchema);
export default Livro;
