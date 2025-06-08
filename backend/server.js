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
app.use('/user',userRoutes);
app.use('/categoria',categoriaRoutes);
app.use('/livro',livroRoutes);

app.get("/", (req,res) =>{
    res.send("Server is Ready");
});

console.log(process.env.MONGO_URI);

app.listen(5000,() =>{
    connectDB();
    console.log("Server started at https://localhost:5000");
});

//
//