---

# 📚 Documentação da API - Bookstore ISCTEM (V3)

Bem-vindo à documentação oficial da API do Bookstore. Esta guia descreve todos os endpoints disponíveis, os dados necessários para as requisições e exemplos das respostas esperadas.

*   **URL Base para Usuários**: `/api/users`
*   **URL Base para Categorias**: `/api/categorias`
*   **URL Base para Livros**: `/api/livros`

---

## 👤 Autenticação e Usuários

Endpoints para gerir o registo, login e dados dos usuários. Rota base: `/api/users`.

### 1. Criar um Novo Usuário (Signup)

- **Endpoint**: **`POST`** `/api/users/signup`
- **Descrição**: Cria um novo perfil de usuário.
- **Corpo da Requisição**:
  ```json
  {
    "name": "Seu Nome Completo",
    "email": "seu.email@exemplo.com",
    "password": "sua_senha_secreta"
  }
  ```
- **Resposta de Sucesso (`201 Created`)**: Retorna os dados do usuário criado e os tokens de acesso.

### 2. Autenticar Usuário (Login)

- **Endpoint**: **`POST`** `/api/users/login`
- **Descrição**: Autentica um usuário. Se o usuário não existir, cria um novo perfil sem senha (ideal para login social).
- **Corpo da Requisição**:
  ```json
  {
    "email": "seu.email@exemplo.com",
    "password": "sua_senha_secreta"
  }
  ```
- **Resposta de Sucesso (`200 OK`)**: Retorna os dados do usuário e os tokens (`accessToken`, `refreshToken`).

### 3. Listar Todos os Usuários

- **Endpoint**: **`GET`** `/api/users/users`
- **Descrição**: Endpoint de administração para visualizar todos os usuários.
- **Resposta de Sucesso (`200 OK`)**: Retorna um array com todos os objetos de usuário.

### 4. Adicionar Livro aos Favoritos

- **Endpoint**: **`POST`** `/api/users/addfav`
- **Descrição**: Adiciona um livro à lista de favoritos do usuário autenticado.
- **Header Obrigatório**: `Authorization: Bearer <seu_accessToken>`
- **Corpo da Requisição**:
  ```json
  {
    "livroId": "68508c0a433e991c8496ce0d"
  }
  ```
- **Resposta de Sucesso (`200 OK`)**: Retorna uma mensagem e a lista atualizada de IDs favoritos.

### 5. Listar os Livros Favoritos

- **Endpoint**: **`GET`** `/api/users/fav`
- **Descrição**: Retorna a lista completa de livros favoritos do usuário autenticado.
- **Header Obrigatório**: `Authorization: Bearer <seu_accessToken>`
- **Resposta de Sucesso (`200 OK`)**: Retorna um array com os objetos dos livros favoritos.

---

## 🗂️ Categorias

Endpoints para gerir as categorias dos livros. Rota base: `/api/categorias`.

### 1. Criar uma Nova Categoria

- **Endpoint**: **`POST`** `/api/categorias/criar_categ`
- **Corpo da Requisição**: `{ "nome": "Aventura" }`
- **Resposta de Sucesso (`201 Created`)**: Retorna o objeto da categoria criada.

### 2. Listar Todas as Categorias (via GET)

- **Endpoint**: **`GET`** `/api/categorias/categorias`
- **Descrição**: Método padrão para listar todas as categorias.
- **Resposta de Sucesso (`200 OK`)**: Retorna um array com todas as categorias.

### 3. Listar Todas as Categorias (via POST)

- **Endpoint**: **`POST`** `/api/categorias/find_categ`
- **Descrição**: Alternativa via `POST` para listar todas as categorias. Pode ser útil se precisar de enviar um corpo na requisição no futuro.
- **Resposta de Sucesso (`200 OK`)**: Retorna um array com todas as categorias.

---

## 📖 Livros

Endpoints para gerir e pesquisar o catálogo de livros. Rota base: `/api/livros`.

### 1. Adicionar um Novo Livro

- **Endpoint**: **`POST`** `/api/livros/createLivro`
- **Descrição**: Regista um novo livro na base de dados.
- **Corpo da Requisição**:
  ```json
  {
    "titulo": "O Senhor dos Anéis",
    "imagem_uri": "https://exemplo.com/lotr.jpg",
    "autores": "J.R.R. Tolkien",
    "descricao": "Uma jornada épica para destruir um anel poderoso...",
    "categoria": ["id_da_categoria_aqui"]
    // ...outros campos
  }
  ```
- **Resposta de Sucesso (`201 Created`)**: Retorna o objeto completo do livro criado.

### 2. Listar Todos os Livros (com Filtro via URL)

- **Endpoint**: **`GET`** `/api/livros/livros`
- **Descrição**: Retorna uma lista de livros, aceitando filtros via query string na URL.
- **Exemplo**: `GET /api/livros/livros?search=Tolkien`

### 3. Pesquisar Livros (com Filtro via Corpo)

- **Endpoint**: **`POST`** `/api/livros/search`
- **Descrição**: Busca livros com base em critérios enviados no corpo da requisição.
- **Corpo da Requisição**:
  ```json
  {
    "search": "anel",
    "categoria": ["id_da_categoria_aqui"]
  }
  ```
- **Resposta de Sucesso (`200 OK`)**: Retorna um array de livros que correspondem aos critérios.

### 4. Listar Livros por Categoria (via ID na URL)

- **Endpoint**: **`POST`** `/api/livros/:categoriaId`
- **Descrição**: Endpoint não-padrão que lista livros de uma categoria específica, identificada pelo `categoriaId` na URL. Pode ser usado para enviar filtros adicionais no corpo da requisição.
- **Exemplo de URL**: `POST /api/livros/68507b8ebeb98940dd13b537`
- **Corpo da Requisição**: Pode ser vazio `{}` ou conter filtros adicionais.
- **Resposta de Sucesso (`200 OK`)**: Retorna os livros da categoria especificada.

---

## 🔧 Solução de Problemas Comuns (Troubleshooting)

Encontrou um erro? Verifique estas causas comuns.

### Erro: `Não autorizado, o token é necessário.`

- **Causa Provável**: O `Header` de autorização está em falta ou mal formatado.
- **Solução**: No seu cliente de API (Postman), use a aba **Authorization**, tipo **`Bearer Token`**, e cole o seu `accessToken` lá. Isto garante que o header `Authorization: Bearer <seu_token>` seja enviado corretamente.

### Erro: `Cast to ObjectId failed for value "Nome da Categoria"`

- **Causa Provável**: Você enviou um nome (ex: "Aventura") num campo que espera um `_id` de referência (ex: `"68507b8ebeb98940dd13b537"`).
- **Solução**: Sempre use o `_id` de um documento para filtros de categoria ou para adicionar um livro favorito.

### Erro: `Cannot destructure property '...' of 'req.body' as it is undefined`

- **Causa Provável**: A sua requisição `POST` não tem o header `Content-Type: application/json`.
- **Solução**: No seu cliente de API, na aba **Body**, certifique-se de que a opção **`raw`** e o tipo **`JSON`** estão selecionados.
