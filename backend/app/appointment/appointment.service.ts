import createHttpError from "http-errors";
import Appointment, { IAppointment } from "./appointment.schema";
import Staff from "../staff/staff.schema";
import Service from "../services/service.schema";
import User from "../users/user.schema";
import { timeToMinutes, addMinutes } from "../common/utils/time.util";
import { notificationQueue } from "../common/services/notification.service";

export class AppointmentService {
  /**
   * Calculates available appointment slots for a given staff, service, and date.
   */
  static async getAvailability(staffId: string, serviceId: string, date: Date) {
    const dayOfWeek = date.getDay();
    date.setHours(0, 0, 0, 0);

    const staff = await Staff.findById(staffId);
    if (!staff) throw createHttpError(404, "Staff not found");

    const service = await Service.findById(serviceId);
    if (!service) throw createHttpError(404, "Service not found");

    // Find staff's working hours for the given day
    const availability = staff.availability.find(
      (a) => a.dayOfWeek === dayOfWeek
    );
    if (!availability) {
      return []; // Staff not available on this day
    }

    // Get all appointments for this staff on the given day
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const existingAppointments = await Appointment.find({
      staff: staffId,
      startTime: { $gte: startOfDay, $lt: endOfDay },
      status: "scheduled",
    }).sort({ startTime: "asc" });

    const serviceDuration = service.duration;
    const availableSlots: Date[] = [];

    const staffStartTime = timeToMinutes(availability.startTime);
    const staffEndTime = timeToMinutes(availability.endTime);

    // Iterate through the staff's working day by service duration increments
    for (
      let slotStart = staffStartTime;
      slotStart < staffEndTime;
      slotStart += serviceDuration
    ) {
      const slotEnd = slotStart + serviceDuration;

      // Slot must end within working hours
      if (slotEnd > staffEndTime) continue;

      const slotStartTime = addMinutes(new Date(date), slotStart);
      const slotEndTime = addMinutes(new Date(date), slotEnd);

      // Check for conflicts with existing appointments
      const isConflict = existingAppointments.some((appt) => {
        const apptStartTime = appt.startTime.getTime();
        const apptEndTime = appt.endTime.getTime();
        // Conflict if the new slot overlaps with an existing appointment
        return (
          slotStartTime.getTime() < apptEndTime &&
          slotEndTime.getTime() > apptStartTime
        );
      });

      if (!isConflict) {
        availableSlots.push(slotStartTime);
      }
    }

    return availableSlots;
  }

  /**
   * Creates a new appointment and schedules notifications.
   */
  static async create(
    userId: string,
    data: { staffId: string; serviceId: string; startTime: Date }
  ): Promise<IAppointment> {
    const { staffId, serviceId, startTime } = data;

    const [user, staff, service] = await Promise.all([
      User.findById(userId).lean(),
      Staff.findById(staffId).populate("user", "name").lean(),
      Service.findById(serviceId).lean(),
    ]);

    if (!user) throw createHttpError(404, "User not found");
    if (!staff) throw createHttpError(404, "Staff not found");
    if (!service) throw createHttpError(404, "Service not found");

    const endTime = addMinutes(new Date(startTime), service.duration);

    // Create the appointment
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
      // Handle potential double booking from the unique index
      if (error.code === 11000) {
        throw createHttpError(
          409,
          "This time slot is no longer available. Please choose another time."
        );
      }
      throw error;
    }

    // --- Add jobs to the notification queue ---

    // 1. Send immediate confirmation

    notificationQueue.add("sendAppointmentConfirmation", {
      userEmail: user.email || "",
      userPhone: user.phone || "",
      userName: user.name || "",
      serviceName: service.name || "",
      staffName: (staff.user && (staff.user as any).name) || "",
      appointmentTime: appointment.startTime,
    });

    // 2. Schedule a reminder for 24 hours before the appointment
    const reminderTime = new Date(appointment.startTime);
    reminderTime.setDate(reminderTime.getDate() - 1);
    const delay = reminderTime.getTime() - Date.now();

    if (delay > 0) {
      notificationQueue.add(
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
