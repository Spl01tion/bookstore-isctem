import mongoose, { Schema } from "mongoose";
import { slugify } from "../utils/http.js";

const livroSchema = new Schema(
    {
        titulo: {
            type: String,
            required: [true, "Título é obrigatório"],
            trim: true,
            maxlength: [200, "Título deve ter no máximo 200 caracteres"],
        },
        slug: { type: String, unique: true, lowercase: true, trim: true },
        imagens: {
            type: [String],
            validate: [(v) => Array.isArray(v) && v.length > 0, "Pelo menos uma imagem é obrigatória"],
        },
        autores: {
            type: String,
            required: [true, "Autor é obrigatório"],
            trim: true,
            maxlength: [100, "Nome do autor deve ter no máximo 100 caracteres"],
        },
        descricao: {
            type: String,
            required: [true, "Descrição é obrigatória"],
            trim: true,
            minlength: [10, "Descrição deve ter pelo menos 10 caracteres"],
            maxlength: [2000, "Descrição deve ter no máximo 2000 caracteres"],
        },
        categoria: {
            type: Schema.Types.ObjectId,
            ref: "Categoria",
            required: [true, "Categoria é obrigatória"],
        },
        publiData: {
            type: Date,
            required: [true, "Data de publicação é obrigatória"],
        },
        editora: {
            type: String,
            trim: true,
            maxlength: [100, "Nome da editora deve ter no máximo 100 caracteres"],
        },
        lingua: { type: String, required: [true, "Idioma é obrigatório"], default: "pt" },
        pag: { type: Number, min: [1, "Número de páginas deve ser positivo"] },
        dimensoes: { type: String, trim: true }, // ex.: "15 x 23 cm"
        peso: { type: Number, min: [0, "Peso não pode ser negativo"] }, // gramas
        preco: {
            type: Number,
            required: [true, "Preço é obrigatório"],
            min: [0, "Preço não pode ser negativo"],
        },
        desconto: {
            type: Number,
            default: 0,
            min: [0, "Desconto mínimo é 0%"],
            max: [100, "Desconto máximo é 100%"],
        }, // percentagem
        stock: { type: Number, default: 0, min: [0, "Stock não pode ser negativo"] },
        vendidos: { type: Number, default: 0, min: 0 },
        destaque: { type: Boolean, default: false },
        activo: { type: Boolean, default: true },
    },
    { timestamps: true }
);

livroSchema.virtual("precoFinal").get(function () {
    return Math.round(this.preco * (100 - (this.desconto || 0))) / 100;
});

livroSchema.pre("validate", function () {
    if (!this.slug && this.titulo) {
        // sufixo curto evita colisões entre livros com o mesmo título
        this.slug = `${slugify(this.titulo)}-${this._id.toString().slice(-6)}`;
    }
});

livroSchema.index({ titulo: "text", autores: "text" });
livroSchema.index({ categoria: 1, activo: 1 });

const Livro = mongoose.model("Livro", livroSchema);
export default Livro;
