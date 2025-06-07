import mongoose,{Schema} from "mongoose";

const categoriaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome da categoria é obrigatório']},
  livros: [{ype: mongoose.Schema.Types.ObjectId, ref: "Livro"}],
  createdAt: {type: Date,default: Date.now},
});

const Categoria = mongoose.model("Categoria", categoriaSchema);
export default Categoria;