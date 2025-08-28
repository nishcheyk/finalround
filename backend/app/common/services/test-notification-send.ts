import dotenv from "dotenv";
dotenv.config();

import { sendEmail } from "./email.service"; // Adjust path if needed
import { sendSMS } from "./sms.service"; // Adjust path if needed

async function testSendEmail() {
  try {
    await sendEmail({
      to: "nishcheycapture2014@gmail.com", // Put your test email here
      subject: "Test Email from Node.js",
      html: "<p>This is a test email sent directly from Node.js script using Nodemailer.</p>",
    });
    console.log("Test email sent successfully");
  } catch (error) {
    console.error("Test email failed:", error);
  }
}

async function testSendSMS() {
  try {
    await sendSMS("+916005284228", "Test SMS from Node.js"); // Put your test phone number
    console.log("Test SMS sent successfully");
  } catch (error) {
    console.error("Test SMS failed:", error);
  }
}

async function runTests() {
  await testSendEmail();
  await testSendSMS();
}

export default runTests();
