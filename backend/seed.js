// Uso: npm run seed
// - Cria (ou promove) o administrador definido em ADMIN_USERNAME / ADMIN_EMAIL / ADMIN_PASSWORD
// - Migra documentos antigos de livros (categoria em array, imagem_uri) para o esquema actual
// - Insere categorias e livros de exemplo se a base de dados estiver vazia
import { config } from "./config/env.js"; // eslint-disable-line no-unused-vars
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import User from "./models/userModel.js";
import Categoria from "./models/categoriaModel.js";
import Livro from "./models/livroModel.js";
import { slugify } from "./utils/http.js";

const criarAdmin = async () => {
    const { ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.log("ADMIN_* não definidos no .env: administrador não criado");
        return;
    }
    const existente = await User.findOne({ $or: [{ username: ADMIN_USERNAME.toLowerCase() }, { email: ADMIN_EMAIL.toLowerCase() }] });
    if (existente) {
        if (existente.role !== "admin") {
            existente.role = "admin";
            await existente.save();
            console.log(`Utilizador "${existente.username}" promovido a admin`);
        } else {
            console.log(`Admin "${existente.username}" já existe`);
        }
        return;
    }
    await User.create({ name: "Administrador", username: ADMIN_USERNAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, role: "admin" });
    console.log(`Admin "${ADMIN_USERNAME}" criado`);
};

const migrarLivrosAntigos = async () => {
    const col = Livro.collection;
    let n = 0;
    for await (const doc of col.find({ $or: [{ categoria: { $type: "array" } }, { imagem_uri: { $exists: true } }, { preco: { $exists: false } }] })) {
        const set = {};
        const unset = {};
        if (Array.isArray(doc.categoria)) set.categoria = doc.categoria[0] ?? null;
        if (doc.imagem_uri) {
            set.imagens = [...(doc.imagens || []), doc.imagem_uri];
            unset.imagem_uri = "";
        }
        if (doc.preco === undefined) set.preco = 0;
        if (doc.activo === undefined) set.activo = true;
        if (doc.stock === undefined) set.stock = 0;
        if (doc.vendidos === undefined) set.vendidos = 0;
        if (!doc.slug) set.slug = `livro-${doc._id.toString().slice(-6)}`;
        await col.updateOne({ _id: doc._id }, { $set: set, ...(Object.keys(unset).length ? { $unset: unset } : {}) });
        n++;
    }
    // O array Categoria.livros deixou de ser usado
    await Categoria.collection.updateMany({ livros: { $exists: true } }, { $unset: { livros: "" } });
    for await (const c of Categoria.collection.find({ slug: { $exists: false } })) {
        await Categoria.collection.updateOne({ _id: c._id }, { $set: { slug: slugify(c.nome || "") || c._id.toString() } });
    }
    if (n) console.log(`${n} livro(s) antigo(s) migrado(s) - rever preço/stock no painel /admin`);
};

const dadosExemplo = async () => {
    if ((await Livro.estimatedDocumentCount()) > 0) {
        console.log("Já existem livros: dados de exemplo não inseridos");
        return;
    }
    const nomes = ["Romance", "Literatura Moçambicana", "Tecnologia", "Gestão"];
    const cats = {};
    for (const nome of nomes) {
        cats[nome] = (await Categoria.findOne({ nome })) ?? (await Categoria.create({ nome }));
    }
    const img = (t) => `https://placehold.co/400x600/png?text=${encodeURIComponent(t)}`;
    const livros = [
        ["Terra Sonâmbula", "Mia Couto", "Literatura Moçambicana", 1250, 10, 25, "Caminho", 1992, 220],
        ["Niketche", "Paulina Chiziane", "Literatura Moçambicana", 1100, 0, 18, "Caminho", 2002, 336],
        ["Ualalapi", "Ungulani Ba Ka Khosa", "Literatura Moçambicana", 900, 15, 12, "Alcance", 1987, 128],
        ["Dom Casmurro", "Machado de Assis", "Romance", 650, 0, 30, "Garnier", 1899, 256],
        ["Clean Code", "Robert C. Martin", "Tecnologia", 2800, 5, 8, "Prentice Hall", 2008, 464],
        ["The Pragmatic Programmer", "Andrew Hunt, David Thomas", "Tecnologia", 3100, 0, 6, "Addison-Wesley", 1999, 352],
        ["O Gestor Eficaz", "Peter F. Drucker", "Gestão", 1500, 20, 10, "Actual", 1967, 208],
    ];
    for (const [titulo, autores, cat, preco, desconto, stock, editora, ano, pag] of livros) {
        await Livro.create({
            titulo,
            autores,
            categoria: cats[cat]._id,
            preco,
            desconto,
            stock,
            editora,
            pag,
            publiData: new Date(`${ano}-01-01`),
            descricao: `${titulo}, de ${autores}. Livro de exemplo inserido pelo script de seed.`,
            imagens: [img(titulo)],
        });
    }
    console.log(`${livros.length} livros de exemplo inseridos`);
};

await connectDB();
try {
    await Promise.all([User.init(), Categoria.init(), Livro.init()]); // garante os índices únicos
    await criarAdmin();
    await migrarLivrosAntigos();
    await dadosExemplo();
} finally {
    await mongoose.disconnect();
}
