# 📚 Documentação da API - Bookstore ISCTEM

Bem-vindo à documentação oficial da API do Bookstore. Esta guia descreve todos os endpoints disponíveis, os dados necessários para as requisições e exemplos das respostas esperadas.

**URL Base da API**: `http://localhost:PORTA` (substitua `PORTA` pela porta onde o seu servidor está a correr, ex: `5000`).

**Header Padrão**: Todas as requisições `POST` devem incluir o header `Content-Type: application/json`.

---

## 👤 Autenticação e Usuários

Endpoints para gerir o registo, login e listagem de usuários.

### 1. Criar um Novo Usuário (Registo)

Regista um novo usuário no sistema.

- **Endpoint**: **`POST`** `/api/users/register`
- **Descrição**: Cria um novo perfil de usuário. Ideal para a página de registo da sua aplicação.
- **Corpo da Requisição**:
  ```json
  {
    "name": "Seu Nome Completo",
    "email": "seu.email@exemplo.com",
    "password": "sua_senha_secreta"
  }
  ```
- **Resposta de Sucesso (`201 Created`)**:
  `json
{
    "message": "User created successfully!",
    "user": {
        "role": "user",
        "avatar": null,
        "isActive": true,
        "_id": "64fcfe0a123abc456def7890",
        "name": "Seu Nome Completo",
        "email": "seu.email@exemplo.com",
        "createdAt": "2023-09-09T12:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
`
  > **Nota**: Conforme solicitado, a senha é guardada como texto simples. Num projeto real, a senha deve ser sempre criptografada com `bcrypt`.

### 2. Autenticar Usuário (Login)

Autentica um usuário existente e retorna os seus dados e tokens de acesso.

- **Endpoint**: **`POST`** `/api/users/login`
- **Descrição**: Valida as credenciais de um usuário e, se corretas, inicia a sua sessão.
- **Corpo da Requisição**:
  ```json
  {
    "email": "seu.email@exemplo.com",
    "password": "sua_senha_secreta"
  }
  ```
- **Resposta de Sucesso (`200 OK`)**:
  ```json
  {
    "message": "Login successful!",
    "user": {
      "_id": "64fcfe0a123abc456def7890",
      "name": "Seu Nome Completo",
      "email": "seu.email@exemplo.com",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 3. Listar Todos os Usuários

Retorna uma lista com todos os usuários registados.

- **Endpoint**: **`GET`** `/api/users`
- **Descrição**: Endpoint de administração para visualizar todos os usuários. Num ambiente de produção, esta rota deve ser protegida e acessível apenas por administradores.
- **Corpo da Requisição**: Nenhum.
- **Resposta de Sucesso (`200 OK`)**:
  ```json
  [
    {
      "role": "admin",
      "avatar": null,
      "isActive": true,
      "_id": "64fcfe0a123abc456def7891",
      "name": "Administrador",
      "email": "admin@exemplo.com",
      "createdAt": "2023-09-09T11:00:00.000Z"
    },
    {
      "role": "user",
      "avatar": null,
      "isActive": true,
      "_id": "64fcfe0a123abc456def7890",
      "name": "Seu Nome Completo",
      "email": "seu.email@exemplo.com",
      "createdAt": "2023-09-09T12:00:00.000Z"
    }
  ]
  ```

### 4. Login Social (ou Sem Senha)

Cria um novo usuário (se não existir) com base no email, sem necessitar de senha.

- **Endpoint**: **`POST`** `/api/users/social-login`
- **Descrição**: Útil para integrações com "Login com Google/Facebook", onde a senha não é gerida pela nossa aplicação.
- **Corpo da Requisição**:
  ```json
  {
    "email": "usuario.novo@gmail.com",
    "role": "user"
  }
  ```
- **Resposta de Sucesso (`200 OK`)**:
  _A resposta é idêntica à do endpoint de login, retornando os dados do usuário e os tokens._

---

## 🗂️ Categorias

Endpoints para gerir as categorias dos livros.

### 1. Criar uma Nova Categoria

Cria uma nova categoria de livros.

- **Endpoint**: **`POST`** `/api/categorias`
- **Descrição**: Permite adicionar novas categorias como "Ficção Científica", "Romance", "Técnico", etc.
- **Corpo da Requisição**:
  ```json
  {
    "nome": "Ficção Científica"
  }
  ```
- **Resposta de Sucesso (`201 Created`)**:
  ```json
  {
    "livros": [],
    "_id": "68507b8ebeb98940dd13b537",
    "nome": "Ficção Científica",
    "createdAt": "2025-06-16T20:16:14.728Z"
  }
  ```

### 2. Listar Todas as Categorias

Retorna uma lista de todas as categorias e os livros que pertencem a cada uma.

- **Endpoint**: **`GET`** `/api/categorias`
- **Descrição**: Ideal para exibir um menu de categorias na aplicação, mostrando os livros de cada uma.
- **Corpo da Requisição**: Nenhum.
- **Resposta de Sucesso (`200 OK`)**:
  ```json
  [
    {
      "_id": "68507b8ebeb98940dd13b537",
      "nome": "Ficção Científica",
      "livros": [
        {
          "_id": "64fd0abc123def4567890123",
          "titulo": "Duna"
        }
      ],
      "createdAt": "2025-06-16T20:16:14.728Z"
    },
    {
      "_id": "685080fd155afb14ada0a50f",
      "nome": "Educacional",
      "livros": [],
      "createdAt": "2025-06-16T20:39:25.679Z"
    }
  ]
  ```

---

## 📖 Livros

Endpoints para gerir o catálogo de livros.

### 1. Adicionar um Novo Livro

Adiciona um novo livro à base de dados e associa-o a categorias existentes.

- **Endpoint**: **`POST`** `/api/livros`
- **Descrição**: Permite registar um livro com todos os seus detalhes.
- **Corpo da Requisição**:
  `json
{
  "titulo": "Clean Code",
  "imagem_uri": "https://exemplo.com/capa.jpg",
  "download_link": "https://exemplo.com/livro.pdf",
  "autores": "Robert C. Martin",
  "descricao": "Um Manual de Artesanato de Software Ágil. Mesmo um mau código pode funcionar. Mas se o código não for limpo, pode pôr uma organização de joelhos.",
  "categoria": ["685080fd155afb14ada0a50f"],
  "publiData": "2008-08-01T00:00:00.000Z",
  "editora": "Prentice Hall",
  "lingua": "en",
  "pag": 464 
}
`

  > **Importante**: O campo `categoria` deve ser um **array** contendo os `_id`'s (como strings) das categorias que já existem.

- **Resposta de Sucesso (`201 Created`)**:
  _A API retorna o objeto completo do livro que acabou de ser criado._

### 2. Listar Todos os Livros

Retorna uma lista de todos os livros no catálogo.

- **Endpoint**: **`GET`** `/api/livros`
- **Descrição**: Ideal para a página principal da livraria, mostrando todos os livros disponíveis.
- **Corpo da Requisição**: Nenhum.
- **Resposta de Sucesso (`200 OK`)**:
  ```json
  [
    {
      "_id": "64fd1234abcd5678efgh9012",
      "titulo": "Clean Code",
      "imagem_uri": "https://exemplo.com/capa.jpg",
      "download_link": "https://exemplo.com/livro.pdf",
      "autores": "Robert C. Martin",
      "descricao": "Um Manual de Artesanato de Software Ágil...",
      "categoria": [
        {
          "_id": "685080fd155afb14ada0a50f",
          "nome": "Educacional"
        }
      ],
      "publiData": "2008-08-01T00:00:00.000Z",
      "editora": "Prentice Hall",
      "lingua": "en",
      "pag": 464
    }
  ]
  ```
