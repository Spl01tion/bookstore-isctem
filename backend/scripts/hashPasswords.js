// Converte passwords guardadas em texto simples para hash bcrypt.
// Uso:  node backend/scripts/hashPasswords.js [--dry-run]
// É seguro correr mais do que uma vez: passwords que já são hash são ignoradas.
import 'dotenv/config';
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User, { BCRYPT_HASH, SALT_ROUNDS } from "../models/userModel.js";

const dryRun = process.argv.includes("--dry-run");

await mongoose.connect(process.env.MONGO_URI);

const users = await User.find({}).select("+password").lean();
let migrated = 0, skipped = 0;

for (const user of users) {
    if (!user.password || BCRYPT_HASH.test(user.password)) {
        skipped++;
        continue;
    }
    if (!dryRun) {
        const hash = await bcrypt.hash(user.password, SALT_ROUNDS);
        // updateOne direto: não reaplica validações nem o hook de save
        await User.updateOne({ _id: user._id, password: user.password }, { $set: { password: hash } });
    }
    migrated++;
    console.log(`${dryRun ? "[dry-run] " : ""}hash aplicado: ${user.email}`);
}

console.log(`\nTotal: ${users.length} | migrados: ${migrated} | já com hash/sem password: ${skipped}`);
await mongoose.disconnect();
