import mongoose,{Schema} from "mongoose";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;
const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$/;

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [50, 'Nome deve ter no máximo 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
    select: false // nunca vem nas queries, a não ser com .select('+password')
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
    },
  isActive: {
    type: Boolean,
    default: true
  }
});
const User = mongoose.model("User", UserSchema);

export { BCRYPT_HASH, SALT_ROUNDS };
export default User;
