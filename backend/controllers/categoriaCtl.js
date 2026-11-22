import Categoria from "../models/categoriaModel.js";

const todasCategorias = async (req, res) => {

    try {
        const categorias = await Categoria.find();
        res.status(200).json({
            success: true,
            categorias,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Falha ao buscar categorias",
            error: error.message,
        })
    }
};


/**
 * @desc    Create a new category
 * @route   POST /api/categorias
 * @access  Private/Admin
 */
const createCategoria = async (req, res) => {
    const { nome } = req.body;

    if (!nome) {
        return res.status(400).json({ message: "O nome da categoria é obrigatório." });
    }

    try {
        // Check if a category with the same name already exists.
        // We use collation to perform a case-insensitive comparison.
        // This is the standard MongoDB way to do this without regex.
        const existingCategoria = await Categoria.findOne({ nome: nome }).collation({
            locale: 'pt', // Use 'pt' for Portuguese rules, 'en' for English
            strength: 2   // Strength 2 treats base letters and case as different, but ignores case.
        });

        if (existingCategoria) {
            return res.status(409).json({ message: "Uma categoria com este nome já existe." });
        }

        // Create and save the new category
        const categoria = new Categoria({
            nome,
        });

        const createdCategoria = await categoria.save();

        res.status(201).json(createdCategoria);

    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation Error", details: error.message });
        }
        console.error("Error in createCategoria:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



// --- NEW: Controller to get all categories ---
/**
 * @desc    Fetch all categories
 * @route   GET /api/categorias
 * @access  Public
 */
const getAllCategorias = async (req, res) => {
    try {
        // 1. Fetch all categories from the database.
        // The .populate('livros') part is optional but very useful.
        // It will replace the book ObjectIds in the 'livros' array with the actual book documents.
        // We can select which book fields to show, e.g., 'titulo autor'.
        const categorias = await Categoria.find({}).populate('livros', 'titulo');

        // 2. Check if any categories were found
        if (!categorias || categorias.length === 0) {
            return res.status(404).json({ message: "Nenhuma categoria encontrada." });
        }

        // 3. Send the successful response
        res.status(200).json(categorias);

    } catch (error) {
        console.error("Error in getAllCategorias:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export { todasCategorias, createCategoria, getAllCategorias };