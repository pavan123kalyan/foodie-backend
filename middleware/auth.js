import jwt from "jsonwebtoken"

const authMiddleware = async (req,res,next) =>{
    const {token} = req.headers;
    if(!token){
        console.log("Auth: No token provided.");
        return res.json({success:false,message:"Not Authorized Login Again"})
    }

    try{
        const token_decode =jwt.verify(token,process.env.JWT_SECRET);
        // Attach userId to req.user (standard practice for authentication)
        // req.user is always an object or can be safely created.
        req.user = { _id: token_decode.id }; // <--- CRITICAL CHANGE: Use req.user._id
        console.log("Auth: Token decoded. userId attached to req.user._id:", req.user._id);
        next();

    }catch (error){
        console.log("Auth: Error decoding token:", error);
        res.json({success:false,message:"Error"})

    }
}
export default authMiddleware;
