import notificationQueue from "./bull-queue.service";
import { sendEmail } from "./email.service";
import { sendSMS } from "./sms.service";
import { Job } from "bull";

// --- Job Processor for Admin Notification Email ---
notificationQueue.process("sendNotificationEmail", async (job: Job) => {
  const { to, subject, html } = job.data;
  try {
    await sendEmail({ to, subject, html });
    console.log(`Admin notification email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send admin notification email to ${to}:`, error);
  }
});

// --- Job Processor for Admin Notification SMS ---
notificationQueue.process("sendNotificationSMS", async (job: Job) => {
  const { to, body } = job.data;
  try {
    await sendSMS(to, body);
    console.log(`Admin notification SMS sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send admin notification SMS to ${to}:`, error);
  }
});

// --- Job Processor for Appointment Confirmation ---
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

  // 1. Send Email Confirmation
  if (userEmail) {
    try {
      const emailHtml = `
        <div style="font-family: sans-serif; line-height: 1.5;">
          <h1>Appointment Confirmed!</h1>
          <p>Dear ${userName},</p>
          <p>Your appointment has been successfully scheduled. Here are the details:</p>
          <hr>
          <p><b>Service:</b> ${serviceName}</p>
          <p><b>With:</b> ${staffName}</p>
          <p><b>When:</b> ${formattedTime}</p>
          <hr>
          <p>If you need to cancel or reschedule, please contact us.</p>
          <p>We look forward to seeing you!</p>
        </div>
      `;
      await sendEmail({ to: userEmail, subject: "Appointment Confirmed", html: emailHtml });
      console.log(`Appointment confirmation email sent to ${userEmail}`);
    } catch (error) {
      console.error(`Failed to send appointment confirmation email to ${userEmail}:`, error);
    }
  }

  // 2. Send SMS Confirmation
  if (userPhone) {
    try {
      const smsBody = `Hi ${userName}, your appointment for ${serviceName} with ${staffName} is confirmed for ${formattedTime}.`;
      await sendSMS(userPhone, smsBody);
      console.log(`Appointment confirmation SMS sent to ${userPhone}`);
    } catch (error) {
      console.error(`Failed to send appointment confirmation SMS to ${userPhone}:`, error);
    }
  }
});
