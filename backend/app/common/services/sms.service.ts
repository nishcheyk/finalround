import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
console.log(process.env.TWILIO_SID);
console.log(process.env.TWILIO_AUTH_TOKEN);
console.log(process.env.TWILIO_PHONE);
console.log(client);

console.log("Twilio client initialized");
export const sendSMS = async (to: string, body: string) => {
  if (!to.startsWith("+"))
    throw new Error("Phone number must be in E.164 format starting with '+'");
  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE,
    to,
  });
};
