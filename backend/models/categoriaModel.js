import mongoose, { Schema } from "mongoose";
import { slugify } from "../utils/http.js";

// A relação Livro -> Categoria é guardada apenas em Livro.categoria
// (para listar os livros de uma categoria: Livro.find({ categoria: id }))
const categoriaSchema = new Schema(
    {
        nome: {
            type: String,
            required: [true, "Nome da categoria é obrigatório"],
            trim: true,
            unique: true,
            maxlength: [80, "Nome da categoria deve ter no máximo 80 caracteres"],
        },
        slug: { type: String, unique: true, lowercase: true, trim: true },
        descricao: { type: String, trim: true, maxlength: [500, "Descrição deve ter no máximo 500 caracteres"] },
    },
    { timestamps: true }
);

categoriaSchema.pre("validate", function () {
    if (!this.slug && this.nome) this.slug = slugify(this.nome);
});

const Categoria = mongoose.model("Categoria", categoriaSchema);
export default Categoria;
