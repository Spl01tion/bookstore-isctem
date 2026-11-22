import 'dotenv/config';
import express from 'express';
import { connectDB } from './config/db.js';
import userRoutes from './routes/user.js';
import categoriaRoutes from './routes/categoria.js';
import livroRoutes from './routes/livro.js';

for (const key of ['MONGO_URI', 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET']) {
    if (!process.env[key]) {
        console.error(`Variável ${key} em falta no .env`);
        process.exit(1);
    }
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

//Rotas
app.use('/user',userRoutes);
app.use('/',userRoutes); // o frontend chama /login, /signup e /profile na raiz
app.use('/',categoriaRoutes); // /categorias, /categoria
app.use('/',livroRoutes);     // /livros, /search, /fav, /addfav, /delfav, /createLivro, /updateLivro, /livro/:categoriaId

app.get("/", (req,res) =>{
    res.send("Server is Ready");
});

// Erros não tratados: resposta JSON, sem stack trace para o cliente
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, message: 'JSON inválido' });
    }
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: 'Erro interno do servidor' });
});

const start = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server started at http://localhost:${PORT}`);
    });
};

start();
