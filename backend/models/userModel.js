import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const EnderecoSchema = new Schema({
    receiverName: { type: String, required: [true, "Nome do destinatário é obrigatório"], trim: true },
    receiverPhone: { type: String, required: [true, "Telefone é obrigatório"], trim: true },
    address: { type: String, required: [true, "Endereço é obrigatório"], trim: true },
});

const UserSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "Nome é obrigatório"],
            trim: true,
            minlength: [2, "Nome deve ter pelo menos 2 caracteres"],
            maxlength: [50, "Nome deve ter no máximo 50 caracteres"],
        },
        username: {
            type: String,
            required: [true, "Nome de utilizador é obrigatório"],
            unique: true,
            lowercase: true,
            trim: true,
            minlength: [3, "Nome de utilizador deve ter pelo menos 3 caracteres"],
            maxlength: [30, "Nome de utilizador deve ter no máximo 30 caracteres"],
            match: [/^[a-z0-9._-]+$/, "Nome de utilizador só pode ter letras, números, '.', '_' e '-'"],
        },
        email: {
            type: String,
            required: [true, "Email é obrigatório"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Email inválido"],
        },
        password: {
            type: String,
            required: [true, "Senha é obrigatória"],
            minlength: [6, "Senha deve ter pelo menos 6 caracteres"],
            select: false, // nunca devolvida por defeito
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        avatar: { type: String, default: null },
        isActive: { type: Boolean, default: true },
        addresses: [EnderecoSchema],
        favorites: [{ type: Schema.Types.ObjectId, ref: "Livro" }],
        downloads: [{ type: Schema.Types.ObjectId, ref: "Livro" }],
    },
    { timestamps: true }
);

// Cifra a senha sempre que é criada ou alterada
UserSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.compararSenha = function (senha) {
    return bcrypt.compare(senha, this.password);
};

const User = mongoose.model("User", UserSchema);

export default User;
