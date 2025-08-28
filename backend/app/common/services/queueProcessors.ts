import notificationQueue from "./bull-queue.service";
import { sendEmail } from "./email.service";
import { sendSMS } from "./sms.service";
import { Job } from "bull";

// Process admin notification email jobs
notificationQueue.process("sendNotificationEmail", async (job: Job) => {
  const { to, subject, html } = job.data;
  console.log("Processing email job:", job.id, to, subject);
  try {
    await sendEmail({ to, subject, html });
    console.log(`Notification email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send notification email to ${to}`, error);
  }
});

notificationQueue.process("sendAppointmentCancellation", async (job: Job) => {
  const {
    userEmail,
    userPhone,
    userName,
    serviceName,
    staffName,
    appointmentTime,
    staffEmail,
    staffPhone,
  } = job.data;

  const formattedTime = new Date(appointmentTime).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  if (userEmail) {
    const emailHtml = `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h1>Appointment Cancelled</h1>
        <p>Dear ${userName},</p>
        <p>Your appointment for <b>${serviceName}</b> with <b>${staffName}</b> on ${formattedTime} has been cancelled.</p>
        <div style="font-size: 12px; color: #888; margin-top: 20px; text-align: center;">
   2025 75 WAYS technologies. All rights reserved.
</div>
        </div>
    `;
    try {
      await sendEmail({
        to: userEmail,
        subject: "Appointment Cancelled",
        html: emailHtml,
      });
      console.log(`Cancellation email sent to ${userEmail}`);
    } catch (err) {
      console.error(`Failed to send cancellation email to ${userEmail}`, err);
    }
  }

  if (userPhone) {
    try {
      const smsBody = `Hi ${userName}, your appointment for ${serviceName} with ${staffName} on ${formattedTime} has been cancelled.`;
      await sendSMS(userPhone, smsBody);
      console.log(`Cancellation SMS sent to ${userPhone}`);
    } catch (err) {
      console.error(`Failed to send cancellation SMS to ${userPhone}`, err);
    }
  }

  if (staffEmail) {
    const staffEmailHtml = `
      <p>The appointment for service <b>${serviceName}</b> with user <b>${userName}</b> on ${formattedTime} was cancelled.</p>
    `;
    try {
      await sendEmail({
        to: staffEmail,
        subject: "Appointment Cancelled",
        html: staffEmailHtml,
      });
      console.log(`Cancellation email sent to staff ${staffEmail}`);
    } catch (err) {
      console.error(
        `Failed to send cancellation email to staff ${staffEmail}`,
        err
      );
    }
  }

  if (staffPhone) {
    try {
      const staffSms = `Appointment for ${serviceName} with user ${userName} on ${formattedTime} was cancelled.`;
      await sendSMS(staffPhone, staffSms);
      console.log(`Cancellation SMS sent to staff ${staffPhone}`);
    } catch (err) {
      console.error(
        `Failed to send cancellation SMS to staff ${staffPhone}`,
        err
      );
    }
  }
});

// Process appointment reschedule notification
notificationQueue.process("sendAppointmentReschedule", async (job: Job) => {
  const {
    userEmail,
    userPhone,
    userName,
    serviceName,
    staffName,
    oldAppointmentTime,
    newAppointmentTime,
    staffEmail,
    staffPhone,
  } = job.data;

  const oldTimeFormatted = new Date(oldAppointmentTime).toLocaleString(
    "en-US",
    {
      dateStyle: "full",
      timeStyle: "short",
    }
  );
  const newTimeFormatted = new Date(newAppointmentTime).toLocaleString(
    "en-US",
    {
      dateStyle: "full",
      timeStyle: "short",
    }
  );

  if (userEmail) {
    const emailHtml = `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h1>Appointment Rescheduled</h1>
        <p>Dear ${userName},</p>
        <p>Your appointment for <b>${serviceName}</b> with <b>${staffName}</b> has been rescheduled:</p>
        <ul>
          <li>Old time: ${oldTimeFormatted}</li>
          <li>New time: ${newTimeFormatted}</li>
        </ul>
          <div style="font-size: 12px; color: #888; margin-top: 20px; text-align: center;">
   2025 75 WAYS technologies. All rights reserved.
</div>
      </div>
    `;
    try {
      await sendEmail({
        to: userEmail,
        subject: "Appointment Rescheduled",
        html: emailHtml,
      });
      console.log(`Reschedule email sent to ${userEmail}`);
    } catch (err) {
      console.error(`Failed to send reschedule email to ${userEmail}`, err);
    }
  }

  if (userPhone) {
    try {
      const smsBody = `Hi ${userName}, your appointment for ${serviceName} with ${staffName} has been rescheduled from ${oldTimeFormatted} to ${newTimeFormatted}.`;
      await sendSMS(userPhone, smsBody);
      console.log(`Reschedule SMS sent to ${userPhone}`);
    } catch (err) {
      console.error(`Failed to send reschedule SMS to ${userPhone}`, err);
    }
  }

  if (staffEmail) {
    const staffEmailHtml = `
      <p>The appointment for service <b>${serviceName}</b> with user <b>${userName}</b> has been rescheduled:</p>
      <ul>
        <li>Old time: ${oldTimeFormatted}</li>
        <li>New time: ${newTimeFormatted}</li>
      </ul>
    `;
    try {
      await sendEmail({
        to: staffEmail,
        subject: "Appointment Rescheduled",
        html: staffEmailHtml,
      });
      console.log(`Reschedule email sent to staff ${staffEmail}`);
    } catch (err) {
      console.error(
        `Failed to send reschedule email to staff ${staffEmail}`,
        err
      );
    }
  }

  if (staffPhone) {
    try {
      const staffSms = `Appointment for ${serviceName} with user ${userName} rescheduled from ${oldTimeFormatted} to ${newTimeFormatted}.`;
      await sendSMS(staffPhone, staffSms);
      console.log(`Reschedule SMS sent to staff ${staffPhone}`);
    } catch (err) {
      console.error(
        `Failed to send reschedule SMS to staff ${staffPhone}`,
        err
      );
    }
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
         <div style="font-size: 12px; color: #888; margin-top: 20px; text-align: center;">
  &copy; 2025 75 WAYS technologies. All rights reserved.
</div>

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
