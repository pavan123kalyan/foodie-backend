import express from "express";
import { addFood,listfood,removeFood} from "../controllers/foodController.js";
import multer from "multer"; //using this, we can create the image storage system

const foodRouter=express.Router(); //using this Router we can create getmethod,postmethod,some more methods

//Image Storage Engine
const storage=multer.diskStorage({
    destination:"uploads",  //cb=callBack
    filename:(req,file,cb)=>{
        return cb(null,`${Date.now()}${file.originalname}`)
    }
})

const upload=multer({storage:storage})  //middleware

foodRouter.post("/add",upload.single("image"),addFood)      //route,used middleware here
foodRouter.get("/list",listfood)
foodRouter.post("/remove",removeFood);


export default foodRouter;