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
  favoritos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Livro' }],
  downloads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Livro' }],
  createdAt: {
    type: Date,
    default: Date.now
    }

});

// Faz hash da password sempre que é criada ou alterada
UserSchema.pre('save', async function () {
    if (!this.isModified('password') || BCRYPT_HASH.test(this.password)) return;
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

UserSchema.methods.comparePassword = function (candidate) {
    if (!this.password || typeof candidate !== 'string') return Promise.resolve(false);
    return bcrypt.compare(candidate, this.password);
};

// Garante que a password nunca é enviada numa resposta JSON
UserSchema.set('toJSON', {
    transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
    }
});

const User = mongoose.model("User",UserSchema);

export { BCRYPT_HASH, SALT_ROUNDS };
export default User;
