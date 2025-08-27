import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE;


const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

export const sendSMS = async (to: string, body: string) => {
  try {
    if (!to.startsWith("+")) {
      throw new Error(
        "Recipient phone number must be in E.164 format, starting with '+' and country code"
      );
    }
    const message = await client.messages.create({
      body,
      from: TWILIO_PHONE,
      to,
    });
    return message;
  } catch (error) {
    throw error;
  }
};
