import notificationQueue from "./bull-queue.service";
import { sendEmail } from "./email.service";
import { sendSMS } from "./sms.service";
import { Job } from "bull";

// Process admin notification email jobs
notificationQueue.process("sendNotificationEmail", async (job: Job) => {
  const { to, subject, html } = job.data;
  try {
    await sendEmail({ to, subject, html });
    console.log(`Notification email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send notification email to ${to}`, error);
  }
});

// Process admin notification SMS jobs
notificationQueue.process("sendNotificationSMS", async (job: Job) => {
  const { to, body } = job.data;
  try {
    await sendSMS(to, body);
    console.log(`Notification SMS sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send notification SMS to ${to}`, error);
  }
});

// Process appointment confirmation jobs
notificationQueue.process("sendAppointmentConfirmation", async (job: Job) => {
  const {
    userEmail,
    userPhone,
    userName,
    serviceName,
    staffName,
    appointmentTime,
  } = job.data;

  const formattedTime = new Date(appointmentTime).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  if (userEmail) {
    try {
      const emailHtml = `
        <div style="font-family: sans-serif; line-height: 1.5;">
          <h1>Appointment Confirmed!</h1>
          <p>Dear ${userName},</p>
          <p>Your appointment details:</p>
          <ul>
            <li><b>Service:</b> ${serviceName}</li>
            <li><b>With:</b> ${staffName}</li>
            <li><b>When:</b> ${formattedTime}</li>
          </ul>
          <p>If you need to change, please contact us.</p>
        </div>
      `;
      await sendEmail({
        to: userEmail,
        subject: "Appointment Confirmed",
        html: emailHtml,
      });
      console.log(`Appointment confirmation email sent to ${userEmail}`);
    } catch (error) {
      console.error(`Failed to send appointment email to ${userEmail}`, error);
    }
  }

  if (userPhone) {
    try {
      const smsBody = `Hi ${userName}, your appointment for ${serviceName} with ${staffName} at ${formattedTime} is confirmed.`;
      await sendSMS(userPhone, smsBody);
      console.log(`Appointment confirmation SMS sent to ${userPhone}`);
    } catch (error) {
      console.error(`Failed to send appointment SMS to ${userPhone}`, error);
    }
  }
});
