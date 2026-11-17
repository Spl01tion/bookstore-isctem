// Converte os documentos Mongoose (campos em português) para o formato
// que o frontend (frontend/types/*.ts) espera.
import { slugify } from "./http.js";

const iso = (d) => (d ? new Date(d).toISOString() : null);

export const categoriaDTO = (c) =>
    c && {
        id: c._id.toString(),
        name: c.nome,
        slug: c.slug,
        description: c.descricao ?? "",
        createdAt: iso(c.createdAt),
        updatedAt: iso(c.updatedAt),
    };

export const livroDTO = (l) => {
    if (!l) return l;
    const id = l._id.toString();
    const desconto = l.desconto || 0;
    const precoFinal = Math.round(l.preco * (100 - desconto)) / 100;
    const categoria = l.categoria && l.categoria.nome !== undefined ? categoriaDTO(l.categoria) : null;

    return {
        id,
        title: l.titulo,
        slug: l.slug,
        description: l.descricao,
        author: l.autores,
        size: l.dimensoes ?? "",
        pages: l.pag ?? 0,
        weight: l.peso ?? 0,
        publishYear: l.publiData ? new Date(l.publiData).getFullYear() : null,
        language: l.lingua,
        price: l.preco,
        discountPrice: precoFinal,
        discount: desconto > 0 ? { id: `${id}-desconto`, name: `${desconto}%`, code: "", percent: desconto } : null,
        stock: l.stock,
        sold: l.vendidos,
        isNew: l.createdAt ? Date.now() - new Date(l.createdAt) < 30 * 24 * 3600 * 1000 : false,
        isFeatured: !!l.destaque,
        status: l.activo !== false,
        category: categoria,
        publisher: l.editora ? { id: slugify(l.editora), name: l.editora, slug: slugify(l.editora) } : { id: "", name: "—", slug: "" },
        bookImages: (l.imagens || []).map((url, i) => ({ id: `${id}-${i}`, url })),
        createdAt: iso(l.createdAt),
        updatedAt: iso(l.updatedAt),
    };
};

export const userDTO = (u) =>
    u && {
        id: u._id.toString(),
        username: u.username,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        status: u.isActive,
        roles: [{ name: u.role.toUpperCase(), description: u.role === "admin" ? "Administrador" : "Utilizador" }],
        addresses: (u.addresses || []).map((a) => ({
            id: a._id.toString(),
            receiverName: a.receiverName,
            receiverPhone: a.receiverPhone,
            address: a.address,
        })),
        favorites: (u.favorites || []).map(String),
        createdAt: iso(u.createdAt),
        updatedAt: iso(u.updatedAt),
    };

export const encomendaDTO = (e) =>
    e && {
        id: e._id.toString(),
        userId: (e.user?._id ?? e.user).toString(),
        receiverName: e.receiverName,
        receiverPhone: e.receiverPhone,
        address: e.address,
        paymentMethod: e.paymentMethod,
        orderStatus: e.orderStatus,
        total: e.total,
        orderDetails: e.itens.map((i, n) => ({
            bookId: i.livro.toString(),
            bookTitle: i.titulo,
            slug: i.slug,
            bookImages: i.imagem ? [{ id: `${e._id}-${n}`, url: i.imagem }] : [],
            quantity: i.quantidade,
            price: i.preco,
        })),
        createdAt: iso(e.createdAt),
        updatedAt: iso(e.updatedAt),
    };
