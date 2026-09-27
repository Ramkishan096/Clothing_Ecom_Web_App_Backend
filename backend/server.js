import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { sendMobileOTP } from "./modules/msg/services/otp.service.js";

dotenv.config();

// Connect to Database
connectDB();
//  await seedProducts();
const PORT = process.env.PORT || 5000;
// const result = await sendMobileOTP("9098781664","8979")
// console.log("result:",result)

app.listen(PORT,"0.0.0.0", () => {
  console.log(`🚀 Server running on port http://${PORT}`);
});

