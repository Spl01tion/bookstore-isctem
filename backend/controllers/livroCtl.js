import mongoose from "mongoose";
import Livro from "../models/livroModel.js";
import Categoria from "../models/categoriaModel.js";
import { AppError, escapeRegex, ok, pagina, paginar } from "../utils/http.js";
import { livroDTO } from "../utils/dto.js";

// Campos do frontend -> campos do modelo (para sortBy=campo:asc|desc)
const ORDENACAO = { title: "titulo", price: "preco", createdAt: "createdAt", sold: "vendidos" };

// Converte o corpo do pedido (nomes do frontend ou em português) para o modelo
const dadosLivro = (b = {}) => {
    const d = {
        titulo: b.title ?? b.titulo,
        autores: b.author ?? b.autores,
        descricao: b.description ?? b.descricao,
        categoria: b.categoryId ?? b.categoria,
        editora: b.publisher ?? b.editora,
        publiData: b.publishDate ?? b.publiData ?? (b.publishYear ? new Date(`${b.publishYear}-01-01`) : undefined),
        lingua: b.language ?? b.lingua,
        pag: b.pages ?? b.pag,
        dimensoes: b.size ?? b.dimensoes,
        peso: b.weight ?? b.peso,
        preco: b.price ?? b.preco,
        desconto: b.discountPercent ?? b.desconto,
        stock: b.stock,
        imagens: b.images ?? b.imagens ?? (b.imagem_uri ? [b.imagem_uri] : undefined),
        download_link: b.downloadLink ?? b.download_link,
        destaque: b.isFeatured ?? b.destaque,
        activo: b.status ?? b.activo,
    };
    return Object.fromEntries(Object.entries(d).filter(([, v]) => v !== undefined));
};

// GET /books/list?pageNo=1&pageSize=8&categorySlug=&sortBy=price:asc&search=
export const listarLivros = async (req, res) => {
    const { categorySlug, search, sortBy } = req.query;
    const pg = paginar(req.query);
    const filtro = { activo: true };

    if (categorySlug) {
        const categoria = await Categoria.findOne({ slug: categorySlug });
        if (!categoria) return ok(res, pagina(pg, 0, []));
        filtro.categoria = categoria._id;
    }
    if (search) {
        const re = new RegExp(escapeRegex(search.trim()), "i");
        filtro.$or = [{ titulo: re }, { autores: re }];
    }

    const [campo, direccao] = String(sortBy || "").split(":");
    const ordem = ORDENACAO[campo] ? { [ORDENACAO[campo]]: direccao === "desc" ? -1 : 1 } : { createdAt: -1 };

    const [total, livros] = await Promise.all([
        Livro.countDocuments(filtro),
        Livro.find(filtro).sort(ordem).skip(pg.skip).limit(pg.pageSize).populate("categoria"),
    ]);

    ok(res, pagina(pg, total, livros.map(livroDTO)));
};

// POST /books/search  { search?, categoria?: [ids] }  - filtro de várias categorias de uma vez
export const pesquisarLivros = async (req, res) => {
    const { search, categoria } = req.body ?? {};
    const filtro = { activo: true };

    if (search) {
        const re = new RegExp(escapeRegex(String(search).trim()), "i"); // escapado: evita ReDoS / regex inválida
        filtro.$or = [{ titulo: re }, { autores: re }];
    }
    if (Array.isArray(categoria) && categoria.length > 0) {
        const ids = categoria.filter((id) => mongoose.isValidObjectId(id));
        if (ids.length !== categoria.length) throw new AppError(400, "ID de categoria inválido");
        filtro.categoria = { $in: ids };
    }

    const livros = await Livro.find(filtro).sort({ titulo: 1 }).limit(100).populate("categoria");
    ok(res, livros.map(livroDTO));
};

// GET /books/slug/:slug
export const livroPorSlug = async (req, res) => {
    const livro = await Livro.findOne({ slug: req.params.slug }).populate("categoria");
    if (!livro) throw new AppError(404, "Livro não encontrado");
    ok(res, livroDTO(livro));
};

// GET /books/:id
export const livroPorId = async (req, res) => {
    const livro = await Livro.findById(req.params.id).populate("categoria");
    if (!livro) throw new AppError(404, "Livro não encontrado");
    ok(res, livroDTO(livro));
};

// GET /books/category/:categoriaId
export const livroPorCategoriaID = async (req, res) => {
    const { categoriaId } = req.params;
    if (!mongoose.isValidObjectId(categoriaId)) throw new AppError(400, "ID de categoria inválido");

    const livros = await Livro.find({ categoria: categoriaId, activo: true }).populate("categoria");
    ok(res, livros.map(livroDTO)); // lista vazia não é erro
};

// POST /books  (admin)
export const criarLivro = async (req, res) => {
    const dados = dadosLivro(req.body);
    if (dados.categoria && !(await Categoria.exists({ _id: dados.categoria }))) {
        throw new AppError(400, "Categoria não existe");
    }
    const livro = await Livro.create(dados);
    await livro.populate("categoria");
    ok(res, livroDTO(livro), "Livro criado", 201);
};

// PUT /books/:id  (admin)
export const actualizarLivro = async (req, res) => {
    const livro = await Livro.findById(req.params.id);
    if (!livro) throw new AppError(404, "Livro não encontrado");

    const dados = dadosLivro(req.body);
    if (dados.categoria && !(await Categoria.exists({ _id: dados.categoria }))) {
        throw new AppError(400, "Categoria não existe");
    }
    livro.set(dados);
    await livro.save();
    await livro.populate("categoria");
    ok(res, livroDTO(livro), "Livro actualizado");
};

// DELETE /books/:id  (admin) - desactiva em vez de apagar, para manter o histórico das encomendas
export const removerLivro = async (req, res) => {
    const livro = await Livro.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    if (!livro) throw new AppError(404, "Livro não encontrado");
    ok(res, null, "Livro removido");
};
