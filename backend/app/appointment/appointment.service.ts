import createHttpError from "http-errors";
import Appointment, { IAppointment } from "./appointment.schema";
import Staff from "../staff/staff.schema";
import Service, { IServiceDocument } from "../services/service.schema";
import User, { IUser } from "../users/user.schema";
import { addMinutes } from "../common/utils/time.util";
import notificationQueue from "../common/services/bull-queue.service";
import { Types } from "mongoose";
import mongoose from "mongoose";
// Type guard for IUser (populated user)
function isUserPopulated(user: Types.ObjectId | IUser): user is IUser {
  return !!(user as IUser).name;
}

// Type guard for IService (populated service)
function isServicePopulated(
  service: Types.ObjectId | IServiceDocument
): service is IServiceDocument {
  return !!(service as IServiceDocument).duration;
}

// Type guard for staff.user (populated user)
function isStaffUserPopulated(staffUser: any): staffUser is IUser {
  return staffUser && typeof staffUser === "object" && "name" in staffUser;
}

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
      staff: new Types.ObjectId(staffId),
      startTime: { $gte: startOfDay, $lt: endOfDay },
      status: "scheduled",
    }).sort({ startTime: "asc" });

    const bookedSlots = existingAppointments.map((appt) => appt.startTime);

    return { bookedSlots };
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
      user: new Types.ObjectId(userId),
      staff: new Types.ObjectId(staffId),
      service: new Types.ObjectId(serviceId),
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

    await notificationQueue.add("sendAppointmentConfirmation", {
      userEmail: user.email || "",
      userPhone: user.phone || "",
      userName: user.name,
      serviceName: service.name,
      staffName: staff.user?.name || "",
      appointmentTime: appointment.startTime,
      staffEmail: staff.user?.email || "",
      staffPhone: staff.user?.phone || "",
      clientName: user.name,
    });

    const reminderDate = new Date(appointment.startTime);
    reminderDate.setHours(reminderDate.getHours() - 24);
    const delay = reminderDate.getTime() - Date.now();

    if (delay > 0) {
      await notificationQueue.add(
        "sendAppointmentReminder",
        {
          userEmail: user.email || "",
          userPhone: user.phone || "",
          userName: user.name,
          serviceName: service.name,
          appointmentTime: appointment.startTime,
        },
        { delay }
      );
    }

    return appointment;
  }

  static async cancelAppointment(
    appointmentId: string,
    userId: string
  ): Promise<IAppointment> {
    console.log(
      `Starting cancelAppointment for appointmentId=${appointmentId}, userId=${userId}`
    );

    if (!Types.ObjectId.isValid(appointmentId)) {
      console.error(`Invalid appointmentId: ${appointmentId}`);
      throw createHttpError(400, "Invalid appointmentId");
    }

    const appointment = await Appointment.findById(appointmentId)
      .populate("user", "name email phone")
      .populate("staff", "user")
      .populate("service");

    if (!appointment) {
      console.error(`Appointment not found for id: ${appointmentId}`);
      throw createHttpError(404, "Appointment not found");
    }

    if (!isUserPopulated(appointment.user)) {
      console.error("Appointment user not populated");
      throw createHttpError(400, "Appointment user not populated");
    }

    if (appointment.user._id.toString() !== userId) {
      console.error(
        `Unauthorized cancel attempt by userId=${userId} on appointment owned by userId=${appointment.user._id.toString()}`
      );
      throw createHttpError(403, "Unauthorized to cancel this appointment");
    }

    if (appointment.status === "cancelled") {
      console.error(`Appointment already cancelled: ${appointmentId}`);
      throw createHttpError(400, "Appointment is already cancelled");
    }

    appointment.status = "cancelled";
    await appointment.save();
    console.log(
      `Appointment status updated to cancelled for id: ${appointmentId}`
    );

    const staffUser = (appointment.staff as any).user;

    await notificationQueue.add("sendAppointmentCancellation", {
      userEmail: appointment.user.email || "",
      userPhone: appointment.user.phone || "",
      userName: appointment.user.name,
      serviceName: isServicePopulated(appointment.service)
        ? appointment.service.name
        : "",
      staffName: isStaffUserPopulated(staffUser) ? staffUser.name : "",
      appointmentTime: appointment.startTime,
      staffEmail: isStaffUserPopulated(staffUser) ? staffUser.email : "",
      staffPhone: isStaffUserPopulated(staffUser) ? staffUser.phone : "",
    });

    console.log(
      `Notification job added for appointment cancellation, appointmentId=${appointmentId}`
    );

    return appointment;
  }

  static async rescheduleAppointment(
    appointmentId: string,
    userId: string,
    newStartTime: Date
  ): Promise<IAppointment> {
    if (!Types.ObjectId.isValid(appointmentId))
      throw createHttpError(400, "Invalid appointmentId");

    const appointment = await Appointment.findById(appointmentId)
      .populate("user", "name email phone")
      .populate("staff", "user")
      .populate("service");

    if (!appointment) throw createHttpError(404, "Appointment not found");

    if (!isUserPopulated(appointment.user))
      throw createHttpError(400, "Appointment user not populated");

    if (appointment.user._id.toString() !== userId)
      throw createHttpError(403, "Unauthorized to reschedule this appointment");

    if (!isServicePopulated(appointment.service))
      throw createHttpError(500, "Service duration not available");

    const endTime = addMinutes(
      new Date(newStartTime),
      appointment.service.duration
    );

    const conflicting = await Appointment.findOne({
      staff: (appointment.staff as any)._id,
      startTime: newStartTime,
      status: "scheduled",
      _id: { $ne: appointment._id },
    });

    if (conflicting)
      throw createHttpError(
        409,
        "This new time slot is not available. Please choose another time."
      );

    const oldStartTime = appointment.startTime;
    appointment.startTime = newStartTime;
    appointment.endTime = endTime;
    appointment.status = "scheduled";
    await appointment.save();

    const staffUser = (appointment.staff as any).user;

    await notificationQueue.add("sendAppointmentReschedule", {
      userEmail: appointment.user.email || "",
      userPhone: appointment.user.phone || "",
      userName: appointment.user.name,
      serviceName: appointment.service.name,
      staffName: isStaffUserPopulated(staffUser) ? staffUser.name : "",
      oldAppointmentTime: oldStartTime,
      newAppointmentTime: newStartTime,
      staffEmail: isStaffUserPopulated(staffUser) ? staffUser.email : "",
      staffPhone: isStaffUserPopulated(staffUser) ? staffUser.phone : "",
    });

    return appointment;
  }

  static async findForUser(userId: string): Promise<IAppointment[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, "Invalid userId");
    }
    return Appointment.find({ user: userId })
      .populate("service", "name duration")
      .populate({ path: "staff", populate: { path: "user", select: "name" } })
      .sort({ startTime: "desc" });
  }

  static async findAll(): Promise<IAppointment[]> {
    return Appointment.find()
      .populate("service", "name duration")
      .populate({ path: "staff", populate: { path: "user", select: "name" } })
      .populate("user", "name email")
      .sort({ startTime: "desc" });
  }

  static async findBusySlotsForStaff(staffId: string, date: string) {
    // Parse the date string to get start of day and end of day
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return Appointment.find({
      staff: new mongoose.Types.ObjectId(staffId),
      status: { $ne: "cancelled" },
      startTime: { $gte: dayStart, $lte: dayEnd },
    })
      .select("startTime")
      .lean();
  }
}
