import mongoose from "mongoose";

const livroSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    minlength: [1, 'Título deve ter pelo menos 1 caractere'],
    maxlength: [200, 'Título deve ter no máximo 200 caracteres']
  },
  imagem_uri: {
    type: String,
    required: true
  },
  // --- NEW FIELD ADDED HERE ---
  download_link: {
    type: String,
    trim: true,
    default: null // Making it explicitly optional
  },
  // --- END OF NEW FIELD ---
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
});

const Livro = mongoose.model("Livro", livroSchema);


export default Livro;