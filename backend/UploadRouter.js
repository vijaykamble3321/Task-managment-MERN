import { randomUUID } from "crypto";
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
// import upload from "./uploads";



const uploadPath="./uploads";

const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
      cb(null,uploadPath);
    },
    filename:(req,file,cb)=>{
      const ext= path.extname(file.originalname);
      const randomName=randomUUID();
      cb(null,`${randomName}.${ext}`);
    },
  })
  const uploadMiddeware=multer({
    storage:storage,
  })

  
const UploadRouter = Router();

UploadRouter.post("/", uploadMiddeware.single("file"),(req, res) => {
    const filename=req.file.filename;
  res.status(200).json({ message: "tests",filename });
});
UploadRouter.get("/:filename",(req,res)=>{
    const {filename}=req.params;
    console.log("filename",filename);
    if(!filename){
        return res.status(400).json({message:"filname rquired"});
    }
    const root= path.resolve()
    const filepath =path.join(root,uploadPath,filename);
    console.log("filepath",filepath);
    

    if(!fs.existsSync(filepath)){
        return res.status(400).json({message:"Invalid file name"});
    }
    res.sendFile(filepath);
    res.status(200).json({filename});
})

export default UploadRouter;
