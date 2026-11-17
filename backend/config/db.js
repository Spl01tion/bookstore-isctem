import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB ligado: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Erro ao ligar ao MongoDB: ${error.message}`);
        process.exit(1); // 1 - Falha, 0 - Sucesso
    }
};
