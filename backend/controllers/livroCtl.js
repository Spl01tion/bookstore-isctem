import mongoose from "mongoose";
import Livro from "../models/livroModel.js";
import Categoria from "../models/categoriaModel.js";
import User from "../models/userModel.js";

const { isValidObjectId } = mongoose;

// Campos que o cliente pode definir num livro (evita gravar campos arbitrários)
const CAMPOS_LIVRO = ['titulo', 'imagem_uri', 'download_link', 'autores', 'descricao', 'categoria', 'publiData', 'editora', 'lingua', 'pag'];

const pick = (obj, keys) =>
    Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

const toIdArray = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const handleError = (res, error, contexto) => {
    if (error.name === 'ValidationError') {
        const message = Object.values(error.errors).map((e) => e.message).join(', ');
        return res.status(400).json({ success: false, message });
    }
    if (error.name === 'CastError') {
        return res.status(400).json({ success: false, message: `Valor inválido para ${error.path}` });
    }
    console.error(`Erro em ${contexto}:`, error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
};

/**
 * POST /livro/:categoriaId — livros de uma categoria (rota original)
 */
const livroPorCategoriaID = async (req, res) => {
    const { categoriaId } = req.params;
    if (!isValidObjectId(categoriaId)) {
        return res.status(400).json({ success: false, message: "ID de categoria inválido" });
    }

    try {
        const livros = await Livro.find({ categoria: categoriaId });

        if (livros.length === 0) {
            return res.status(404).json({ success: false, message: "Nenhum livro encontrado" });
        }
        res.status(200).json({ success: true, livros });
    } catch (error) {
        handleError(res, error, 'livroPorCategoriaID');
    }
};

/**
 * GET /livros — todos os livros (array), com o nome das categorias
 */
const getAllLivros = async (req, res) => {
    try {
        const livros = await Livro.find({}).populate('categoria', 'nome');
        res.status(200).json(livros);
    } catch (error) {
        handleError(res, error, 'getAllLivros');
    }
};

/**
 * POST /search — body: { search?: string, categoria?: string[] }
 */
const searchLivros = async (req, res) => {
    const { search, categoria } = req.body ?? {};
    const filter = {};

    if (typeof search === 'string' && search.trim()) {
        const regex = new RegExp(escapeRegex(search.trim()), 'i');
        filter.$or = [{ titulo: regex }, { autores: regex }];
    }

    const categorias = toIdArray(categoria).filter(isValidObjectId);
    if (categorias.length > 0) {
        filter.categoria = { $in: categorias };
    }

    try {
        const livros = await Livro.find(filter).populate('categoria', 'nome');
        res.status(200).json(livros);
    } catch (error) {
        handleError(res, error, 'searchLivros');
    }
};

/**
 * POST /createLivro — apenas admin
 */
const createLivro = async (req, res) => {
    const dados = pick(req.body ?? {}, CAMPOS_LIVRO);
    dados.categoria = toIdArray(dados.categoria);

    if (!dados.titulo || !dados.autores || !dados.descricao || !dados.imagem_uri || dados.categoria.length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Título, autores, descrição, imagem e pelo menos uma categoria são obrigatórios.'
        });
    }
    if (!dados.categoria.every(isValidObjectId)) {
        return res.status(400).json({ success: false, message: 'ID de categoria inválido.' });
    }
    if (!dados.pag) delete dados.pag; // o frontend envia 0 quando o campo está vazio

    try {
        const existentes = await Categoria.countDocuments({ _id: { $in: dados.categoria } });
        if (existentes !== dados.categoria.length) {
            return res.status(400).json({ success: false, message: 'Categoria não encontrada.' });
        }

        const livro = await Livro.create(dados);
        await Categoria.updateMany(
            { _id: { $in: livro.categoria } },
            { $addToSet: { livros: livro._id } }
        );

        res.status(201).json(livro);
    } catch (error) {
        handleError(res, error, 'createLivro');
    }
};

/**
 * PUT /updateLivro/:id — apenas admin
 */
const updateLivro = async (req, res) => {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
        return res.status(400).json({ success: false, message: 'ID do livro inválido.' });
    }

    const dados = pick(req.body ?? {}, CAMPOS_LIVRO);
    if (dados.categoria !== undefined) {
        dados.categoria = toIdArray(dados.categoria);
        if (dados.categoria.length === 0 || !dados.categoria.every(isValidObjectId)) {
            return res.status(400).json({ success: false, message: 'Categoria inválida.' });
        }
    }

    try {
        const anterior = await Livro.findById(id).select('categoria');
        if (!anterior) {
            return res.status(404).json({ success: false, message: 'Livro não encontrado.' });
        }

        const livro = await Livro.findByIdAndUpdate(id, dados, { new: true, runValidators: true });

        // Mantém a lista `livros` das categorias sincronizada
        if (dados.categoria) {
            const antes = anterior.categoria.map(String);
            const depois = livro.categoria.map(String);
            const removidas = antes.filter((c) => !depois.includes(c));
            const adicionadas = depois.filter((c) => !antes.includes(c));
            if (removidas.length) await Categoria.updateMany({ _id: { $in: removidas } }, { $pull: { livros: livro._id } });
            if (adicionadas.length) await Categoria.updateMany({ _id: { $in: adicionadas } }, { $addToSet: { livros: livro._id } });
        }

        res.status(200).json(livro);
    } catch (error) {
        handleError(res, error, 'updateLivro');
    }
};

/**
 * GET /fav — livros favoritos do utilizador autenticado
 */
const getFavoriteBooks = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'favoritos',
            select: 'titulo imagem_uri imagens autores',
        });
        res.status(200).json(user?.favoritos ?? []);
    } catch (error) {
        handleError(res, error, 'getFavoriteBooks');
    }
};

/**
 * POST /addfav — body: { livroId }
 */
const addFavoriteBook = async (req, res) => {
    const { livroId } = req.body ?? {};
    if (!livroId || !isValidObjectId(livroId)) {
        return res.status(400).json({ success: false, message: "O ID do livro é obrigatório." });
    }

    try {
        if (!(await Livro.exists({ _id: livroId }))) {
            return res.status(404).json({ success: false, message: "Livro não encontrado." });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { favoritos: livroId } },
            { new: true, select: 'favoritos' }
        );

        res.status(200).json({ message: "Livro adicionado aos favoritos com sucesso!", favoritos: user.favoritos });
    } catch (error) {
        handleError(res, error, 'addFavoriteBook');
    }
};

/**
 * DELETE /delfav/:livroId
 */
const removeFavoriteBook = async (req, res) => {
    const { livroId } = req.params;
    if (!isValidObjectId(livroId)) {
        return res.status(400).json({ success: false, message: "ID do livro inválido." });
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { favoritos: livroId } },
            { new: true, select: 'favoritos' }
        );

        res.status(200).json({ message: "Livro removido dos favoritos com sucesso!", favoritos: user.favoritos });
    } catch (error) {
        handleError(res, error, 'removeFavoriteBook');
    }
};

export {
    livroPorCategoriaID, getAllLivros, searchLivros, createLivro, updateLivro,
    getFavoriteBooks, addFavoriteBook, removeFavoriteBook,
};
