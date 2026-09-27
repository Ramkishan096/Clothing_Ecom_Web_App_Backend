import getCloudinaryMulter from "./CloudinaryService.js"

export const ProductImages = async(req,res)=>{
    try{
        console.log('hit AddProduct Api for testing ...... ')
        
         const id = req.params.id;
         console.log("id:",id)

        const upload = getCloudinaryMulter({
            folder: `BlackStudio/ProductImages/${id}`,
            isPrivate: false,
            format: "webp",
        })

        upload.single('file')(req,res,(err)=>{
            if(err) {
                return res.status(400).json({ success: false, error: err.message });
            }
            if(!req.file) {
                return res.status(400).json({ success: false, error: "No file uploaded" });
            }

            const { path, filename, mimetype } = req.file;
            console.log("res.file:",req.file)

            console.log('-------------------------------')
            console.log('path = ',path)
            console.log('filename = ',filename)
            console.log('mimetype = ',mimetype)

            return res.status(200).json({
                success: true,
                message: "Image uploaded successfully",
                filename:filename,
            });
        });
    }
    catch{
        console.log('hit AddProduct Api for testing ...... falied .....')
        return res.status(401).json({success :false,message :"falied to upload image",data:null,error :null})
    }


}

export const DeleteImage = async(req,res)=>{

    try{
        console.log('Hit DeleteImage Api....')
        const ImagePublidID = req.body.imagePublicId
        console.log('ImagePublidID =>',ImagePublidID)

        const result = await cloudinary.uploader.destroy(ImagePublidID,{ invalidate: true });

        console.log("result =>",result)
        return res.status(200).json({success :true,message :"Delete Image Succesfully.",data:result,error :null})
      
    }
    catch(error){
        console.log('failed to handel DeleteImage....',error)
        return res.status(500).json({success :false,message :"Internall Server Error",data:null,error :null})
    }
}



