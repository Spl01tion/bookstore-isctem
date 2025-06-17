import Livro from "../models/livroModel.js";
import Categoria from "../models/categoriaModel.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import User from "../models/userModel.js";
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



/**
 * @desc    Search/filter books using request body
 * @route   POST /search
 * @access  Public
 */

const searchLivros = async (req, res) => {
    try {
        const filter = {};
        const { search, categoria } = req.body;

        // --- LÓGICA DE BUSCA COM REGEX ---
        if (search) {
            // Cria uma expressão regular para fazer uma busca parcial e case-insensitive ('i')
            const regex = new RegExp(search, 'i');

            // Procura o texto de busca tanto no título QUANTO nos autores
            // O operador $or significa: "encontre documentos onde o título corresponde OU o autor corresponde"
            filter.$or = [
                { titulo: { $regex: regex } },
                { autores: { $regex: regex } }
            ];
        }
        // --- FIM DA LÓGICA DE BUSCA ---

        if (categoria && categoria.length > 0) {
            // Esta parte continua igual, esperando um array de IDs de categoria
            filter.categoria = { $in: categoria };
        }

        const livros = await Livro.find(filter).populate('categoria', 'nome');

        res.status(200).json(livros);

    } catch (error) {
        console.error("Erro na busca de livros via body:", error);
        res.status(500).json({ message: "Erro ao processar a sua busca.", error: error.message });
    }
};



/**
 * @desc    Get the logged-in user's favorite books (versão simples)
 * @route   GET /api/users/favorites
 * @access  Private
 */
const getFavoriteBooks = async (req, res) => {
    let token;

    // 1. Tenta encontrar o token no header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Extrai o token
            token = req.headers.authorization.split(' ')[1];

            // 3. Verifica e decodifica o token para obter o ID do usuário
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            // 4. Busca o usuário e popula a sua lista de favoritos numa única query
            const user = await User.findById(decoded.userId).populate({
                path: 'favoritos', // O nome do campo no Schema do Usuário
                select: 'titulo imagem_uri autores' // Pega apenas os campos que nos interessam do livro
            });

            // Se o usuário não for encontrado (ex: foi apagado), retorna um erro
            if (!user) {
                return res.status(404).json({ message: 'Usuário não encontrado.' });
            }

            // 5. Retorna a lista de livros favoritos
            res.status(200).json(user.favoritos);

        } catch (error) {
            // Se o token for inválido ou expirado
            res.status(401).json({ message: 'Token inválido ou expirado.' });
        }
    } else {
        // Se nenhum token for enviado na requisição
        res.status(401).json({ message: 'Não autorizado, o token é necessário.' });
    }
};



/**
 * @desc    Adicionar um livro à lista de favoritos do usuário
 * @route   POST /api/users/favorites
 * @access  Private
 */
const addFavoriteBook = async (req, res) => {
    // Pega o livroId do corpo da requisição
    const { livroId } = req.body;
    let token;

    // 1. Verifica se o livroId foi enviado
    if (!livroId) {
        return res.status(400).json({ message: "O ID do livro é obrigatório." });
    }

    // 2. Autentica o usuário (mesma lógica do getFavoriteBooks)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const userId = decoded.userId;

            // 3. Adiciona o livro aos favoritos usando $addToSet
            // $addToSet é perfeito aqui: ele só adiciona o ID se ele ainda não existir na lista,
            // evitando duplicados. É uma operação atómica e eficiente.
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $addToSet: { favoritos: livroId } },
                { new: true, select: 'favoritos' } // Retorna o documento atualizado, apenas o campo 'favoritos'
            );

            // Se o usuário não for encontrado
            if (!updatedUser) {
                return res.status(404).json({ message: "Usuário não encontrado." });
            }

            // 4. Envia uma resposta de sucesso
            res.status(200).json({
                message: "Livro adicionado aos favoritos com sucesso!",
                favoritos: updatedUser.favoritos // Retorna a lista atualizada de IDs
            });

        } catch (error) {
            res.status(401).json({ message: 'Token inválido ou expirado.' });
        }
    } else {
        res.status(401).json({ message: 'Não autorizado, o token é necessário.' });
    }
};




export { livroPorCategoriaID, getAllLivros, createLivro, getFavoriteBooks, searchLivros, addFavoriteBook };