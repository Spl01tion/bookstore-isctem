
import os from 'os';


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



function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    const results = [];

    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if (
                iface.family === 'IPv4' &&
                !iface.internal &&
                !/vEthernet|Virtual|VMware|Loopback|TAP|Pseudo/i.test(name)
            ) {
                //  console.log(`Interface: ${name}, Address: ${iface.address}`);
                results.push({ name, address: iface.address });
            }
        }
    }

    // console.log(results);
    // wifi aqu

    let my_custom_netAdress = results.filter((el) => {
        return el.name == 'Wi-Fi';
    })[0].address;

    console.log(my_custom_netAdress);
    // return results;
    return my_custom_netAdress;
}
app.use(express.json());

//See
app.get("/", (req, res) => {
    res.json({ message: "Server is Ready" });
});

console.log(process.env.MONGO_URI);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    connectDB();

    const ip = getLocalIPAddress();
    console.log("Rede pra cell abaixo");
    console.log(`http://${ip}:${PORT}`);
    console.log("Rede pro pc");

    console.log(`Server started at http://localhost:${PORT}`);

});


//
//