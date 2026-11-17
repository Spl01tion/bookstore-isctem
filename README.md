# BookStore ISCTEM

Livraria online: API REST em **Node.js + Express 5 + MongoDB (Mongoose)** e app móvel em **Expo / React Native** (`frontend/`).

## Arranque rápido

```bash
# 1. Backend
npm install
cp .env.example .env        # preencher MONGO_URI e os segredos
npm run seed                # cria o admin (ADMIN_*) e livros de exemplo
npm run dev                 # http://localhost:8080/bookstore

# 2. Frontend
cd frontend
npm install
# em frontend/.env: EXPO_PUBLIC_API_ENDPOINT=http://<IP-do-PC-na-rede>:8080/bookstore
npm start
```

No telemóvel, `localhost` refere-se ao próprio telemóvel. Por isso, o `EXPO_PUBLIC_API_ENDPOINT` tem de usar o IP do computador na rede local (`ipconfig`).

Painel de administração: `http://localhost:8080/admin`. Só entram contas com `role: "admin"`.

## Estrutura

```
backend/
  server.js              arranque, CORS, rotas, tratamento de erros
  seed.js                admin inicial, migração de dados antigos, livros de exemplo
  config/  env.js        valida e expõe as variáveis de ambiente
           db.js         ligação ao MongoDB
           setup.js      painel AdminJS (/admin)
  middleware/ auth.js    autenticar (JWT Bearer) e autorizar("admin")
              errorHandler.js  respostas de erro uniformes
  models/    User, Categoria, Livro, Encomenda
  controllers/ authCtl, userCtl, categoriaCtl, livroCtl, encomendaCtl
  routes/    auth, user, categoria, livro, encomenda
  utils/     http.js (resposta, paginação, slug), dto.js (formato do frontend)
```

## API

Todas as respostas têm o formato `{ code, message, data }`. Prefixo: `/bookstore`.
🔒 indica que é preciso o header `Authorization: Bearer <token>`, e 👑 que é preciso ser admin.

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | `{ username, password }` (aceita username ou email) → `{ token, refreshToken, authenticated }` |
| POST | `/auth/refresh` | `{ refreshToken }` → novos tokens |
| POST | `/users/add` | registo `{ name, username, email, password }` |
| GET | `/users/me` 🔒 | perfil do utilizador autenticado |
| PUT | `/users/me` 🔒 | `{ name?, avatar? }` |
| PUT | `/users/me/password` 🔒 | `{ currentPassword, newPassword }` |
| POST | `/users/me/addresses` 🔒 | `{ receiverName, receiverPhone, address }` |
| DELETE | `/users/me/addresses/:id` 🔒 | remover endereço |
| GET | `/users/me/favorites` 🔒 | livros favoritos |
| POST | `/users/me/favorites` 🔒 | `{ livroId }` adicionar aos favoritos |
| DELETE | `/users/me/favorites/:livroId` 🔒 | remover dos favoritos |
| GET | `/users` 👑 | listar utilizadores |
| PUT | `/users/:id/password` 👑 | `{ newPassword }` redefinir a senha de um utilizador |
| GET | `/categories` | listar categorias |
| GET | `/categories/:slug` | uma categoria |
| POST/PUT/DELETE | `/categories[/:id]` 👑 | gerir categorias |
| GET | `/books/list?pageNo&pageSize&categorySlug&search&sortBy` | lista paginada; `sortBy` = `title:asc`, `price:desc`, … |
| POST | `/books/search` | `{ search?, categoria?: [ids] }` pesquisa com várias categorias |
| GET | `/books/slug/:slug` · `/books/:id` | um livro (inclui `downloadLink`, se existir) |
| GET | `/books/category/:categoriaId` | livros de uma categoria |
| POST/PUT/DELETE | `/books[/:id]` 👑 | gerir livros (DELETE só desactiva) |
| POST | `/orders` 🔒 | `{ receiverName, receiverPhone, address, paymentMethod, orderDetails: [{ bookId, quantity }] }` |
| GET | `/orders/:id` 🔒 | encomenda (só do próprio ou admin) |
| GET | `/orders/list/user/:userId` 🔒 | encomendas do utilizador (paginado) |
| GET | `/orders` 👑 | todas as encomendas (`?status=PENDING`) |
| PATCH | `/orders/:id/status` 👑 | `{ orderStatus }`; `CANCELLED` devolve o stock |

### Decisões de segurança

- As senhas são cifradas com bcrypt e nunca são devolvidas nas respostas.
- O registo público cria sempre `role: "user"`. Para promover alguém a admin, usa o painel `/admin` ou `npm run seed`.
- O preço e o total das encomendas são calculados no servidor a partir da base de dados. Os preços enviados pelo cliente são ignorados.
- O stock é reservado de forma atómica: não é possível vender mais do que existe.
