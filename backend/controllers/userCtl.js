import User from "../models/userModel.js";
import { AppError, ok } from "../utils/http.js";
import { userDTO } from "../utils/dto.js";

// POST /users/add  { name, username, email, password }
// O papel (role) nunca vem do cliente: todo o registo público é "user".
export const registar = async (req, res) => {
    const { name, username, email, password } = req.body ?? {};
    const user = await User.create({ name, username, email, password, role: "user" });
    ok(res, userDTO(user), "Conta criada com sucesso", 201);
};

// GET /users/me
export const perfil = async (req, res) => {
    ok(res, userDTO(req.user));
};

// PUT /users/me  { name?, avatar? }
export const actualizarPerfil = async (req, res) => {
    const { name, avatar } = req.body ?? {};
    if (name !== undefined) req.user.name = name;
    if (avatar !== undefined) req.user.avatar = avatar;
    await req.user.save();
    ok(res, userDTO(req.user), "Perfil actualizado");
};

// PUT /users/me/password  { currentPassword, newPassword }
export const alterarSenha = async (req, res) => {
    const { currentPassword, newPassword } = req.body ?? {};
    if (!currentPassword || !newPassword) throw new AppError(400, "Senha actual e nova senha são obrigatórias");

    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.compararSenha(String(currentPassword)))) throw new AppError(401, "Senha actual incorrecta");

    user.password = newPassword;
    await user.save();
    ok(res, null, "Senha alterada");
};

// POST /users/me/addresses  { receiverName, receiverPhone, address }
export const adicionarEndereco = async (req, res) => {
    const { receiverName, receiverPhone, address } = req.body ?? {};
    req.user.addresses.push({ receiverName, receiverPhone, address });
    await req.user.save();
    ok(res, userDTO(req.user), "Endereço adicionado", 201);
};

// DELETE /users/me/addresses/:addressId
export const removerEndereco = async (req, res) => {
    const endereco = req.user.addresses.id(req.params.addressId);
    if (!endereco) throw new AppError(404, "Endereço não encontrado");
    endereco.deleteOne();
    await req.user.save();
    ok(res, userDTO(req.user), "Endereço removido");
};

// GET /users  (admin)
export const listarUtilizadores = async (_req, res) => {
    const users = await User.find().sort({ createdAt: -1 });
    ok(res, users.map(userDTO));
};
