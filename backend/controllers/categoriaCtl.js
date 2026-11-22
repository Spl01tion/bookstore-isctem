import Categoria from "../models/categoriaModel.js";

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * POST /categoria — formato original: { success, categorias }
 */
const todasCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.find();
        res.status(200).json({ success: true, categorias });
    } catch (error) {
        console.error("Erro em todasCategorias:", error);
        res.status(500).json({ success: false, message: "Falha ao buscar categorias" });
    }
};

/**
 * GET /categorias — array de categorias (formato usado pelo frontend)
 */
const getAllCategorias = async (req, res) => {
    try {
        const categorias = await Categoria.find({}).sort({ nome: 1 }).populate('livros', 'titulo');
        res.status(200).json(categorias);
    } catch (error) {
        console.error("Erro em getAllCategorias:", error);
        res.status(500).json({ success: false, message: "Falha ao buscar categorias" });
    }
};

/**
 * POST /categorias — body: { nome } — apenas admin
 */
const createCategoria = async (req, res) => {
    const nome = typeof req.body?.nome === 'string' ? req.body.nome.trim() : '';

    if (!nome) {
        return res.status(400).json({ success: false, message: "O nome da categoria é obrigatório." });
    }

    try {
        // Comparação sem distinguir maiúsculas/minúsculas
        const existente = await Categoria.findOne({ nome: new RegExp(`^${escapeRegex(nome)}$`, 'i') });
        if (existente) {
            return res.status(409).json({ success: false, message: "Uma categoria com este nome já existe." });
        }

        const categoria = await Categoria.create({ nome });
        res.status(201).json(categoria);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        // Ex.: "Classicos" quando já existe "Clássicos" (mesmo slug)
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: "Já existe uma categoria com um nome equivalente." });
        }
        console.error("Erro em createCategoria:", error);
        res.status(500).json({ success: false, message: "Erro ao criar categoria" });
    }
};

export { todasCategorias, getAllCategorias, createCategoria };
