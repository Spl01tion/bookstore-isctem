import jwt from "jsonwebtoken";
import User from "../models/userModel";



const generateTokens=() =>{
    const accessToken = jwt.sign(
        {userId: user?._id},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:"2d"}
    );  

    const refreshToken = jwt.sign(
        {userId: user?._id},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:"7d"}
    ); 

    return {accessToken,refreshToken};
}
const loginOrSignUp = async(req,res) =>{

    const {email,role} = req.body;
    try{

        let user = await User.findOne({email})

        if(!user){
            user = new User({role,email});
            await user.save();
        }else{
            user.role = role;
            await user.save();
        }

        const { } = generateTokens(user.toObject());

        res.status(200).json({
            user,
            accessToken,
            refreshToken,
        });
    }catch(error){
        console.log(err);
        res.status(500).json({error: err.message});
    }
}

export {loginOrSignUp};