// Formato de resposta esperado pelo frontend: { code, message, data }

export class AppError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

export const ok = (res, data, message = "Sucesso", status = 200) =>
    res.status(status).json({ code: status, message, data });

export const paginar = (query, { maxPageSize = 100 } = {}) => {
    const pageNo = Math.max(1, parseInt(query.pageNo, 10) || 1);
    const pageSize = Math.min(maxPageSize, Math.max(1, parseInt(query.pageSize, 10) || 10));
    return { pageNo, pageSize, skip: (pageNo - 1) * pageSize };
};

export const pagina = ({ pageNo, pageSize }, total, items) => ({
    pageNo,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    totalItems: total,
    items,
});

export const slugify = (texto) =>
    String(texto)
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

export const escapeRegex = (texto) => String(texto).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
