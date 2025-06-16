import Livro from "../models/livroModel.js";
import Categoria from "../models/categoriaModel.js";
import mongoose from "mongoose";
const livroPorCategoriaID = async (req, res) => {

    const { categoriaId } = req.params;

    try {
        const livros = await Livro.find({ categoria: categoriaId });

        if (!livros || livros.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Nenhum livro encontrado"
            });
        }
        res.status(200).json({
            success: true,
            livros,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Falha ao buscar livros",
            error: error.message,
        })
    }
};


/**
 * @desc    Register a new book
 * @route   POST /createLivro
 * @body    {titulo, imagem_uri, download_link, autores, descricao, categoria, publiData, editora, lingua, pag}
 * @access  Private/Admin
 */


const createLivro = async (req, res) => {
    const {
        titulo, imagem_uri, download_link, autores, descricao,
        categoria: categoriaIds,
        publiData, editora, lingua, pag
    } = req.body;

    if (!titulo || !autores || !descricao || !categoriaIds || !categoriaIds.length) {
        return res.status(400).json({ message: 'Título, autores, descrição e pelo menos uma categoria são obrigatórios.' });
    }

    try {
        // Step 1: Create and save the new book
        const newLivro = new Livro({
            titulo, imagem_uri, download_link, autores, descricao,
            categoria: categoriaIds,
            publiData, editora, lingua, pag
        });

        const savedLivro = await newLivro.save();

        // Step 2: Update the categories
        // This is a separate operation. If it fails, the book will still exist.
        if (savedLivro) {
            await Categoria.updateMany(
                { '_id': { $in: savedLivro.categoria } },
                { $push: { 'livros': savedLivro._id } }
            );
        }

        res.status(201).json(savedLivro);

    } catch (error) {
        console.error("Error in createLivro:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation Error", details: error.message });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * @desc    Fetch all books
 * @route   GET /api/livros
 * @access  Public
 */
const getAllLivros = async (req, res) => {
    try {
        // Fetch all books and populate the 'categoria' field with the category name
        const livros = await Livro.find({}).populate('categoria', 'nome');

        if (!livros || livros.length === 0) {
            return res.status(404).json({ message: "Nenhum livro encontrado." });
        }

        res.status(200).json(livros);

    } catch (error) {
        console.error("Error in getAllLivros:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export { livroPorCategoriaID, getAllLivros, createLivro };