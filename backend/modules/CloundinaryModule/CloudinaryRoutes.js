import express from 'express'
import { DeleteImage, ProductImages } from './checkingUploads.js'
import { isAdmin, verifyToken } from '../userAuth/middlewares/auth.middleware.js'


const Router = express.Router()

Router.post('/product/:id',verifyToken,isAdmin,ProductImages)
Router.post("/deleteimage",verifyToken,isAdmin,DeleteImage)


export default Router




