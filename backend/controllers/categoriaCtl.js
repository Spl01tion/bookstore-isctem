import Categoria from "../models/categoriaModel.js";
import Livro from "../models/livroModel.js";
import { AppError, ok, slugify } from "../utils/http.js";
import { categoriaDTO } from "../utils/dto.js";

// GET /categories
export const todasCategorias = async (_req, res) => {
    const categorias = await Categoria.find().sort({ nome: 1 });
    ok(res, categorias.map(categoriaDTO));
};

// GET /categories/:slug
export const categoriaPorSlug = async (req, res) => {
    const categoria = await Categoria.findOne({ slug: req.params.slug });
    if (!categoria) throw new AppError(404, "Categoria não encontrada");
    ok(res, categoriaDTO(categoria));
};

// POST /categories  (admin)  { name, description? }
export const criarCategoria = async (req, res) => {
    const { name, description } = req.body ?? {};
    const categoria = await Categoria.create({ nome: name, descricao: description });
    ok(res, categoriaDTO(categoria), "Categoria criada", 201);
};

// PUT /categories/:id  (admin)
export const actualizarCategoria = async (req, res) => {
    const categoria = await Categoria.findById(req.params.id);
    if (!categoria) throw new AppError(404, "Categoria não encontrada");

    const { name, description } = req.body ?? {};
    if (name !== undefined) {
        categoria.nome = name;
        categoria.slug = slugify(name);
    }
    if (description !== undefined) categoria.descricao = description;
    await categoria.save();
    ok(res, categoriaDTO(categoria), "Categoria actualizada");
};

// DELETE /categories/:id  (admin)
export const removerCategoria = async (req, res) => {
    const emUso = await Livro.exists({ categoria: req.params.id });
    if (emUso) throw new AppError(409, "Não é possível remover: existem livros nesta categoria");

    const categoria = await Categoria.findByIdAndDelete(req.params.id);
    if (!categoria) throw new AppError(404, "Categoria não encontrada");
    ok(res, null, "Categoria removida");
};
