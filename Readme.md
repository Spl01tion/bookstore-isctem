- A aplicação tem um fluxo de autenticação robusto.
- A tela de início é o nosso dashboard principal, com busca, filtros, refresh, e um modal de detalhes.
- Implementámos as telas de Registo, "Esqueci a Senha" (simulada), e Registo de Livros.
- A navegação para telas como Favoritos e Perfil está preparada, mas as telas em si ainda não foram construídas.

Aqui está a documentação.

---

# 📚 Documentação da API - Bookstore ISCTEM (V4)

Bem-vindo à documentação oficial da API do Bookstore. Esta guia descreve todos os endpoints disponíveis, os dados necessários para as requisições e exemplos das respostas esperadas.

- **URL Base da API**: `http://SEU_IP_LOCAL:PORTA`

---

## 👤 Usuários e Autenticação

**Rota Base**: `/api/users`

### 1. Registar Novo Usuário (Signup)

- **Endpoint**: **`POST`** `/api/users/signup`
- **Descrição**: Cria um novo perfil de usuário (estudante).
- **Corpo da Requisição**:
  ```json
  {
    "name": "Nome Completo do Estudante",
    "email": "codigo_estudante@exemplo.com",
    "password": "senha_do_estudante"
  }
  ```
- **Resposta de Sucesso (`201 Created`)**: Retorna o objeto do usuário recém-criado.
- **Resposta de Erro (`409 Conflict`)**: Se o email (código de estudante) já estiver em uso.

### 2. Autenticar Usuário (Login)

- **Endpoint**: **`POST`** `/api/users/login`
- **Descrição**: Valida as credenciais de um usuário e retorna os seus dados e um token de acesso.
- **Corpo da Requisição**:
  ```json
  {
    "email": "codigo_estudante@exemplo.com",
    "password": "senha_do_estudante"
  }
  ```
- **Resposta de Sucesso (`200 OK`)**:
  ```json
  {
    "user": {
      "_id": "id_do_usuario",
      "name": "Nome do Usuário",
      "email": "email@do.usuario",
      "role": "user"
    },
    "accessToken": "um_token_jwt_longo...",
    "refreshToken": "outro_token_jwt_longo..."
  }
  ```

### 3. Adicionar Livro aos Favoritos

- **Endpoint**: **`POST`** `/api/users/addfav`
- **Descrição**: Adiciona um livro à lista de favoritos do usuário autenticado.
- **Autenticação**: Requer `Bearer Token`.
- **Corpo da Requisição**:
  ```json
  {
    "livroId": "id_do_livro_a_adicionar"
  }
  ```
- **Resposta de Sucesso (`200 OK`)**: Retorna uma mensagem de sucesso e a lista atualizada de IDs favoritos.

### 4. Redefinir Senha (Demonstração)

- **Endpoint**: **`POST`** `/api/users/redefinir-senha`
- **Descrição**: Endpoint de demonstração/administrativo para redefinir a senha de um usuário diretamente.
- **Corpo da Requisição**:
  ```json
  {
    "email": "email_do_usuario@exemplo.com",
    "novaSenha": "nova_senha_123"
  }
  ```
- **Resposta de Sucesso (`200 OK`)**: Retorna uma mensagem de sucesso.

---

## 📖 Livros

**Rota Base**: `/api/livros`

### 1. Registar Novo Livro

- **Endpoint**: **`POST`** `/api/livros/createLivro`
- **Descrição**: Regista um novo livro no catálogo.
- **Autenticação**: Requer `Bearer Token` (idealmente, apenas para administradores).
- **Corpo da Requisição**:
  ```json
  {
    "titulo": "O Nome do Vento",
    "autores": "Patrick Rothfuss",
    "descricao": "A história de Kvothe...",
    "imagem_uri": "https://exemplo.com/capa.jpg",
    "download_link": "https://exemplo.com/livro.pdf",
    "publiData": "2007-03-27T00:00:00.000Z",
    "editora": "Arcanist Press",
    "pag": 662,
    "categoria": ["id_da_categoria_aqui"]
  }
  ```
- **Resposta de Sucesso (`201 Created`)**: Retorna o objeto do livro recém-criado.

### 2. Listar Todos os Livros

- **Endpoint**: **`GET`** `/api/livros/livros`
- **Descrição**: Retorna uma lista de todos os livros no catálogo. Aceita filtros via query string na URL.
- **Exemplo de Filtro**: `GET /api/livros/livros?search=Vento`
- **Resposta de Sucesso (`200 OK`)**: Retorna um array com todos os objetos de livro.

### 3. Pesquisar Livros (via Corpo)

- **Endpoint**: **`POST`** `/api/livros/search`
- **Descrição**: Alternativa de busca que aceita os critérios de filtro no corpo (body) da requisição.
- **Corpo da Requisição**:
  ```json
  {
    "search": "Kvothe",
    "categoria": ["id_da_categoria_fantasia"]
  }
  ```
- **Resposta de Sucesso (`200 OK`)**: Retorna um array de livros que correspondem aos critérios.

---

## 🗂️ Categorias

**Rota Base**: `/api/categorias`

### 1. Listar Todas as Categorias

- **Endpoint**: **`GET`** `/api/categorias/categorias`
- **Descrição**: Retorna um array com todas as categorias disponíveis. Útil para popular menus de filtro.
- **Resposta de Sucesso (`200 OK`)**:
  ```json
  [
    { "_id": "id_categoria_1", "nome": "Ficção Científica", "livros": [...] },
    { "_id": "id_categoria_2", "nome": "Fantasia", "livros": [...] }
  ]
  ```

---

## 🔧 Solução de Problemas Comuns (Troubleshooting)

Encontrou um erro? Verifique estas causas comuns.

### Erro: `Não autorizado, o token é necessário.`

- **Causa Provável**: O `Header` de autorização está em falta ou mal formatado na sua requisição.
- **Solução**: No seu cliente de API (Postman), use a aba **Authorization**, tipo **`Bearer Token`**, e cole o seu `accessToken` lá. Isto garante que o header `Authorization: Bearer <seu_token>` seja enviado corretamente.

### Erro: `Cast to ObjectId failed for value "Nome da Categoria"`

- **Causa Provável**: Você enviou um nome (ex: "Fantasia") num campo que espera um `_id` de referência (ex: `"68507b8ebeb98940dd13b537"`).
- **Solução**: Sempre use o `_id` de um documento para filtros de categoria ou para adicionar um livro favorito.
