import Encomenda, { ESTADOS } from "../models/encomendaModel.js";
import Livro from "../models/livroModel.js";
import { AppError, ok, pagina, paginar } from "../utils/http.js";
import { encomendaDTO } from "../utils/dto.js";

const podeVer = (req, userId) => req.user.role === "admin" || req.user._id.equals(userId);

// POST /orders
// { receiverName, receiverPhone, address, paymentMethod, orderDetails: [{ bookId, quantity }] }
// O utilizador vem do token e os preços/total são calculados no servidor
// (nunca se confia no preço enviado pelo cliente).
export const criarEncomenda = async (req, res) => {
    const { receiverName, receiverPhone, address, paymentMethod, orderDetails } = req.body ?? {};
    if (!Array.isArray(orderDetails) || orderDetails.length === 0) {
        throw new AppError(400, "A encomenda deve ter pelo menos um livro");
    }

    // Junta linhas repetidas do mesmo livro
    const quantidades = new Map();
    for (const { bookId, quantity } of orderDetails) {
        const q = parseInt(quantity, 10);
        if (!bookId || !(q > 0)) throw new AppError(400, "Cada item precisa de bookId e quantity > 0");
        quantidades.set(String(bookId), (quantidades.get(String(bookId)) || 0) + q);
    }

    const livros = await Livro.find({ _id: { $in: [...quantidades.keys()] }, activo: true });
    if (livros.length !== quantidades.size) throw new AppError(400, "Um ou mais livros não existem");

    // Reserva o stock de forma atómica; se algum falhar, devolve o que já foi reservado
    const reservados = [];
    try {
        for (const livro of livros) {
            const q = quantidades.get(livro._id.toString());
            const r = await Livro.updateOne(
                { _id: livro._id, stock: { $gte: q } },
                { $inc: { stock: -q, vendidos: q } }
            );
            if (r.modifiedCount === 0) throw new AppError(409, `Stock insuficiente para "${livro.titulo}"`);
            reservados.push([livro._id, q]);
        }

        const itens = livros.map((l) => ({
            livro: l._id,
            titulo: l.titulo,
            slug: l.slug,
            imagem: l.imagens?.[0],
            quantidade: quantidades.get(l._id.toString()),
            preco: l.precoFinal,
        }));
        const total = Math.round(itens.reduce((s, i) => s + i.preco * i.quantidade, 0) * 100) / 100;

        const encomenda = await Encomenda.create({
            user: req.user._id,
            receiverName,
            receiverPhone,
            address,
            paymentMethod,
            itens,
            total,
        });
        ok(res, encomendaDTO(encomenda), "Encomenda criada", 201);
    } catch (err) {
        await Promise.all(
            reservados.map(([id, q]) => Livro.updateOne({ _id: id }, { $inc: { stock: q, vendidos: -q } }))
        );
        throw err;
    }
};

// GET /orders/:id
export const encomendaPorId = async (req, res) => {
    const encomenda = await Encomenda.findById(req.params.id);
    if (!encomenda || !podeVer(req, encomenda.user)) throw new AppError(404, "Encomenda não encontrada");
    ok(res, encomendaDTO(encomenda));
};

// GET /orders/list/user/:userId?pageNo=&pageSize=
export const encomendasDoUtilizador = async (req, res) => {
    const { userId } = req.params;
    if (!podeVer(req, userId)) throw new AppError(403, "Sem permissão para ver estas encomendas");

    const pg = paginar(req.query, { maxPageSize: 50 });
    const [total, encomendas] = await Promise.all([
        Encomenda.countDocuments({ user: userId }),
        Encomenda.find({ user: userId }).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.pageSize),
    ]);
    ok(res, pagina(pg, total, encomendas.map(encomendaDTO)));
};

// GET /orders  (admin)
export const todasEncomendas = async (req, res) => {
    const pg = paginar(req.query, { maxPageSize: 50 });
    const filtro = req.query.status ? { orderStatus: req.query.status } : {};
    const [total, encomendas] = await Promise.all([
        Encomenda.countDocuments(filtro),
        Encomenda.find(filtro).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.pageSize),
    ]);
    ok(res, pagina(pg, total, encomendas.map(encomendaDTO)));
};

// PATCH /orders/:id/status  (admin)  { orderStatus }
export const actualizarEstado = async (req, res) => {
    const { orderStatus } = req.body ?? {};
    if (!ESTADOS.includes(orderStatus)) throw new AppError(400, `Estado inválido. Use: ${ESTADOS.join(", ")}`);

    const encomenda = await Encomenda.findById(req.params.id);
    if (!encomenda) throw new AppError(404, "Encomenda não encontrada");

    // Cancelar devolve o stock
    if (orderStatus === "CANCELLED" && encomenda.orderStatus !== "CANCELLED") {
        await Promise.all(
            encomenda.itens.map((i) =>
                Livro.updateOne({ _id: i.livro }, { $inc: { stock: i.quantidade, vendidos: -i.quantidade } })
            )
        );
    }
    encomenda.orderStatus = orderStatus;
    await encomenda.save();
    ok(res, encomendaDTO(encomenda), "Estado actualizado");
};
