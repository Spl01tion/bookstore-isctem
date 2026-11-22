// Cria uma conta de administrador, ou promove a admin uma conta que já existe.
// Uso:
//   npm run create-admin -- --email gestor@bookstore.local --name "Gestor" [--password "..."]
// Sem --password é gerada uma password aleatória, mostrada uma única vez.
// Se o email já existir, a conta passa a admin; a password só muda se --password for indicado.
import 'dotenv/config';
import crypto from "node:crypto";
import mongoose from "mongoose";
import User from "../models/userModel.js";

function arg(name) {
    const i = process.argv.indexOf(`--${name}`);
    return i !== -1 ? process.argv[i + 1] : undefined;
}

const email = arg("email")?.trim().toLowerCase();
const name = arg("name")?.trim() || "Administrador";
const passwordArg = arg("password");

if (!email) {
    console.error('Falta o email. Ex.: npm run create-admin -- --email gestor@bookstore.local --name "Gestor"');
    process.exit(1);
}
if (passwordArg !== undefined && passwordArg.length < 6) {
    console.error("A password deve ter pelo menos 6 caracteres.");
    process.exit(1);
}
if (!process.env.MONGO_URI) {
    console.error("MONGO_URI não está definido no .env");
    process.exit(1);
}

// 16 caracteres sem símbolos ambíguos (0/O, 1/l/I)
const generatePassword = () => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    return Array.from(crypto.randomBytes(16), (b) => alphabet[b % alphabet.length]).join("");
};

await mongoose.connect(process.env.MONGO_URI);

try {
    const existing = await User.findOne({ email }).select("+password");

    if (existing) {
        existing.role = "admin";
        if (passwordArg) existing.password = passwordArg;
        await existing.save({ validateModifiedOnly: true });
        console.log(`Conta existente promovida a admin: ${email}`);
        console.log(passwordArg ? "Password atualizada para a indicada." : "Password não foi alterada.");
    } else {
        const password = passwordArg ?? generatePassword();
        await User.create({ name, email, password, role: "admin" });
        console.log(`Conta admin criada: ${email} (${name})`);
        if (!passwordArg) console.log(`Password gerada: ${password}\nGuarde-a agora; não volta a ser mostrada.`);
    }
} catch (error) {
    if (error.name === "ValidationError") {
        console.error(Object.values(error.errors).map((e) => e.message).join("\n"));
    } else {
        console.error("Erro:", error.message);
    }
    process.exitCode = 1;
} finally {
    await mongoose.disconnect();
}
