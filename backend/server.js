import express from 'express';
import dotenv from "dotenv";
import { connectDB } from './config/db.js';
import userRoutes from './routes/user.js';
import categoriaRoutes from './routes/categoria.js';
import livroRoutes from './routes/livro.js';

dotenv.config();
const app = express();

app.use(express.json());

//Rotas
app.use(userRoutes);
app.use(categoriaRoutes);
app.use(livroRoutes);


//See
app.get("/", (req, res) => {
    res.json({ message: "Server is Ready" });
});

console.log(process.env.MONGO_URI);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    connectDB();
    console.log(`Server started at http://localhost:${PORT}`);
});


//
//