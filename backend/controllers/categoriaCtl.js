import Categoria from "../models/categoriaModel.js";

const todasCategorias= async(req,res) =>{

    try{
        const categorias = await Categoria.find();
        res.status(200).json({
            success: true,
            categorias,
        });
    } catch(error){
        res.status(500).json({
            success: false,
            message: "Falha ao buscar categorias",
            error:err.message,
        })
    }
};

export {todasCategorias};