
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import cloudinary from "./CloudinaryConfig.js";

import crypto from 'crypto'


const getCloudinaryMulter = ({ folder, isPrivate = false, format = "auto" }) => {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder,
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}-${crypto.randomUUID()}`,
      resource_type: "image",
      format: format !== "auto" ? format : undefined,
      type: isPrivate ? "private" : "upload", // private or public
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    }),
  });

  return multer({ storage });
};

export default getCloudinaryMulter
