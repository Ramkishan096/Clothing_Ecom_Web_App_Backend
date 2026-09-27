import axios from "axios";

let shiprocketToken = null;


export async function generateShiprocketToken() {
    try {
        console.log('genrate Token For Shiprocket...')
        const response = await axios.post(
            "https://apiv2.shiprocket.in/v1/external/auth/login",
            {
                email: process.env.SHIPROCKET_EMAIL,
                password: process.env.SHIPROCKET_PASSWORD
            }
        );
        //console.log(response.data)
        shiprocketToken = response.data.token;
        console.log("Shiprocket Token Generated", shiprocketToken);
        return shiprocketToken;

    } catch (error) {
        console.error("Shiprocket Auth Error:", error.response?.data);
        throw error;
    }
}


export async function getShiprocketToken() {
    console.log('get Shiprocket Token...')
    if (!shiprocketToken) {
        await generateShiprocketToken();
    }
    return shiprocketToken;
}   