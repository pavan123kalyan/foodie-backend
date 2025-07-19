import mongoose from "mongoose";
export const connectDB=async()=>{
    await mongoose.connect('mongodb+srv://paidipellipavan:S7lIcB7LrlP13o4A@cluster0.2h9pi0k.mongodb.net/Food_Delivery').then(()=>console.log('DB connected Successfully '));
    
}