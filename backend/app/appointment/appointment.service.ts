import createHttpError from "http-errors";
import Appointment, { IAppointment } from "./appointment.schema";
import Staff from "../staff/staff.schema";
import Service from "../services/service.schema";
import User from "../users/user.schema";
import { addMinutes } from "../common/utils/time.util";
import notificationQueue from "../common/services/bull-queue.service";

interface AvailabilityResponse {
  bookedSlots: Date[];
}

export class AppointmentService {
  static async getAvailability(
    staffId: string,
    serviceId: string,
    date: Date
  ): Promise<AvailabilityResponse> {
    date.setHours(0, 0, 0, 0);

    const staff = await Staff.findById(staffId);
    if (!staff) throw createHttpError(404, "Staff not found");

    const service = await Service.findById(serviceId);
    if (!service) throw createHttpError(404, "Service not found");

    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const existingAppointments = await Appointment.find({
      staff: staffId,
      startTime: { $gte: startOfDay, $lt: endOfDay },
      status: "scheduled",
    }).sort({ startTime: "asc" });

    const bookedSlots: Date[] = existingAppointments.map(
      (appt) => appt.startTime
    );

    return {
      bookedSlots,
    };
  }

  static async create(
    userId: string,
    data: { staffId: string; serviceId: string; startTime: Date }
  ): Promise<IAppointment> {
    const { staffId, serviceId, startTime } = data;

    const [user, staff, service] = await Promise.all([
      User.findById(userId).lean(),
      Staff.findById(staffId).populate("user", "name email phone").lean(),
      Service.findById(serviceId).lean(),
    ]);

    if (!user) throw createHttpError(404, "User not found");
    if (!staff) throw createHttpError(404, "Staff not found");
    if (!service) throw createHttpError(404, "Service not found");

    const endTime = addMinutes(new Date(startTime), service.duration);

    const appointment = new Appointment({
      user: userId,
      staff: staffId,
      service: serviceId,
      startTime,
      endTime,
    });

    try {
      await appointment.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw createHttpError(
          409,
          "This time slot is no longer available. Please choose another time."
        );
      }
      throw error;
    }

    // Enqueue confirmation email and SMS to user
    if (user.email) {
      await notificationQueue.add("sendNotificationEmail", {
        to: user.email,
        subject: "Appointment Confirmed",
        html: `<div style='font-family: sans-serif;'>
                <h2>Appointment Confirmed</h2>
                <p>Your appointment for ${service.name} with ${staff.user?.name} is confirmed on ${appointment.startTime.toLocaleString()}</p>
              </div>`,
      });
      console.log(`Enqueued email job for user ${user.email}`);
    }

    if (user.phone) {
      await notificationQueue.add("sendNotificationSMS", {
        to: user.phone,
        body: `Appointment confirmed: ${service.name} with ${staff.user?.name} at ${appointment.startTime.toLocaleString()}`,
      });
      console.log(`Enqueued SMS job for user ${user.phone}`);
    }

    // Enqueue notification email and SMS to staff
    if (staff.user?.email) {
      await notificationQueue.add("sendNotificationEmail", {
        to: staff.user.email,
        subject: "New Appointment Scheduled",
        html: `<div style='font-family: sans-serif;'>
                <h2>New Appointment Scheduled</h2>
                <p>Service: ${service.name}</p>
                <p>Client: ${user.name}</p>
                <p>When: ${appointment.startTime.toLocaleString()}</p>
              </div>`,
      });
      console.log(`Enqueued email job for staff ${staff.user.email}`);
    }

    if (staff.user?.phone) {
      await notificationQueue.add("sendNotificationSMS", {
        to: staff.user.phone,
        body: `New appointment for ${service.name} with client ${user.name} at ${appointment.startTime.toLocaleString()}`,
      });
      console.log(`Enqueued SMS job for staff ${staff.user.phone}`);
    }

    // Schedule reminder for user 24 hours before appointment
    const reminderDate = new Date(appointment.startTime);
    reminderDate.setHours(reminderDate.getHours() - 24);
    const delay = reminderDate.getTime() - Date.now();

    if (delay > 0) {
      await notificationQueue.add(
        "sendAppointmentReminder",
        {
          userEmail: user.email || "",
          userPhone: user.phone || "",
          userName: user.name || "",
          serviceName: service.name || "",
          appointmentTime: appointment.startTime,
        },
        { delay }
      );
      console.log(`Scheduled appointment reminder for user ${user.email}`);
    }

    return appointment;
  }

  static async findForUser(userId: string): Promise<IAppointment[]> {
    return Appointment.find({ user: userId })
      .populate("service", "name duration")
      .populate({ path: "staff", populate: { path: "user", select: "name" } })
      .sort({ startTime: "desc" });
  }
}
