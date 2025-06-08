import Livro from "../models/livroModel.js";

const livroPorCategoriaID = async(req,res) =>{

    const {categoriaId} = req.params;

    try{
        const livros = await Livro.find({categoria:categoriaId});

        if(!livros || livros.length === 0){
            return res.status(404).json({
                success: false,
                message: "Nenhum livro encontrado"
            });
        }
        res.status(200).json({
            success: true,
            livros,
        });
    } catch(error){
        res.status(500).json({
            success: false,
            message: "Falha ao buscar livros",
            error:err.message,
        })
    }
};

export {livroPorCategoriaID};