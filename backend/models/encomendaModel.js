import mongoose, { Schema } from "mongoose";

export const ESTADOS = ["PENDING", "CONFIRMED", "SHIPPING", "DELIVERED", "CANCELLED"];
export const METODOS_PAGAMENTO = ["COD", "MPESA", "EMOLA", "CARD"];

// Guarda uma cópia do título/preço no momento da compra,
// para o histórico não mudar se o livro for alterado depois.
const ItemSchema = new Schema(
    {
        livro: { type: Schema.Types.ObjectId, ref: "Livro", required: true },
        titulo: { type: String, required: true },
        slug: { type: String, required: true },
        imagem: { type: String },
        quantidade: { type: Number, required: true, min: [1, "Quantidade mínima é 1"] },
        preco: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const encomendaSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        receiverName: { type: String, required: [true, "Nome do destinatário é obrigatório"], trim: true },
        receiverPhone: { type: String, required: [true, "Telefone é obrigatório"], trim: true },
        address: { type: String, required: [true, "Endereço é obrigatório"], trim: true },
        paymentMethod: { type: String, enum: METODOS_PAGAMENTO, default: "COD" },
        orderStatus: { type: String, enum: ESTADOS, default: "PENDING" },
        itens: {
            type: [ItemSchema],
            validate: [(v) => v.length > 0, "A encomenda deve ter pelo menos um livro"],
        },
        total: { type: Number, required: true, min: 0 },
    },
    { timestamps: true }
);

const Encomenda = mongoose.model("Encomenda", encomendaSchema);
export default Encomenda;
