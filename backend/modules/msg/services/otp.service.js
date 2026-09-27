import { sendOTP } from "../providers/APITxt.provider.js";

export const sendMobileOTP = async (mobile,otp) => {
    return await sendOTP({
        mobile,    
        otp
    });
};

