import notificationQueue from "./bull-queue.service";
import { sendBookingNotification } from "./email.service";
import { sendSMS } from "./sms.service";

notificationQueue.process("sendNotification", async (job) => {
  const {
    email,
    phone,
    subject,
    message,
    qrCode,
    seatNumbers,
    seatCategories,
    reservationName,
  } = job.data as {
    email?: string;
    phone?: string;
    subject: string;
    message?: string;
    qrCode: string | string[];
    seatNumbers: string[];
    seatCategories: string[];
    reservationName: string;
  };

  if (email) {
    try {
      await sendBookingNotification({
        toEmail: email,
        subject,
        message,
        qrContent: qrCode,
        seatNumbers,
        seatCategories,
        reservationName,
      });
    } catch (err) {
      console.error(`Failed to send email to ${email}`, err);
    }
  }

  if (phone) {
    try {
      await sendSMS(
        phone,
        message ||
          `Booking confirmed for ${reservationName}. Seats: ${seatNumbers.join(", ")}`
      );
    } catch (error) {
      console.error(`Failed to send SMS to ${phone}:`, error);
    }
  }
});

export { notificationQueue };
