import userModel from "../models/userModel.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import validator from "validator"


//login user
const loginUser = async(req,res)=>{
    const {email,password}=req.body;
    try{
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({success:false,message:"User doesn't exist"})
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.json({success:false,message:"Invalid Credentials"})
        }
        const token = createToken(user._id);//we get token from user
        res.json({success:true,token})
    }catch(error){
        console.log(error);
        res.json({success:false,message:"Error"})
        
    }
}


const createToken =(id) =>{
    return jwt.sign({id},process.env.JWT_SECRET) //when we generate token ,we have 1 object with id,when we decode it we get id(it is in auth.js)
}
//register user
const registerUser = async(req,res)=>{

    const {name,password,email}=req.body;
    try{
        //checking that is user already exists?
        const exists=await userModel.findOne({email});
        if(exists){
            return res.json({success:false,message:"User alreasy exists"})
        }

        //validate email & strong password
        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Please enter a valid email"})

        }
        if(password.length<8){
            return res.json({success:false,message:"Please enter a strong password"})
        }
        
        //hashing user password
        const salt=await bcrypt.genSalt(10)
        const hashedPassword=await bcrypt.hash(password,salt);

        //creating new user using  name,password,email
        const newUser = new userModel({
            name :name,
            email:email,
            password:hashedPassword
        })
        const user =await newUser.save() //saving data and store in user variable ,after we create token 
        const token =createToken(user._id)
        res.json({success:true,token})
    } catch(error){

        console.log(error);
        res.json({success:false,message:"Error"})
    }
    
}

export {loginUser,registerUser}