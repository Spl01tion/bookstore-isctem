import mongoose,{Schema} from "mongoose";
import { slugify } from "../utils/slugify.js";

const categoriaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome da categoria é obrigatório']},
  livros: [{type: mongoose.Schema.Types.ObjectId, ref: "Livro"}],
  createdAt: {type: Date,default: Date.now},
  // A coleção tem um índice único em `slug`: tem de ser sempre preenchido
  slug: { type: String, trim: true },
});

// "Ficção Científica" -> "ficcao-cientifica" (mesmo formato dos dados existentes)
categoriaSchema.pre('validate', function () {
  if (!this.slug) this.slug = slugify(this.nome);
});

const Categoria = mongoose.model("Categoria", categoriaSchema);
export default Categoria;