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

   /* The above code is using TypeScript to query the database for existing appointments. It is finding
   appointments where the staff ID matches the provided `staffId`, the `startTime` is greater than
   or equal to `startOfDay` and less than `endOfDay`, and the `status` is "scheduled". The
   appointments are then sorted in ascending order based on their `startTime`. */
    const existingAppointments = await Appointment.find({
      staff: new Types.ObjectId(staffId),
      startTime: { $gte: startOfDay, $lt: endOfDay },
      status: "scheduled",
    }).sort({ startTime: "asc" });

    const bookedSlots = existingAppointments.map((appt) => appt.startTime);

    return { bookedSlots };
  }

  /**
   * This static async function creates an appointment for a user with a specific staff member and
   * service, handling validations and sending notifications.
   * @param {string} userId - The `userId` parameter in the `create` method represents the unique
   * identifier of the user for whom the appointment is being created. This ID is used to fetch the
   * user details and associate the appointment with the correct user.
   * @param data - The `data` parameter in the `create` method contains the following properties:
   * @returns The `create` method is returning the newly created appointment object of type
   * `IAppointment`.
   */
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

/**
 * The function `cancelAppointment` in TypeScript cancels an appointment based on the provided
 * appointmentId and userId, handling various validation checks and sending a notification upon
 * cancellation.
 * @param {string} appointmentId - The `appointmentId` parameter is a string that represents the unique
 * identifier of the appointment that needs to be cancelled.
 * @param {string} userId - The `userId` parameter in the `cancelAppointment` function represents the
 * unique identifier of the user who is attempting to cancel the appointment. This parameter is used to
 * verify the authorization of the user before allowing the cancellation of the appointment associated
 * with the `appointmentId`.
 * @returns The `cancelAppointment` function returns the updated appointment object after setting its
 * status to "cancelled" and saving it.
 */
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

/**
 * The function `rescheduleAppointment` in TypeScript asynchronously updates an appointment, checks for
 * availability, and adds a notification to a queue for sending an appointment reschedule notification.
 * @param {string} appointmentId - The `appointmentId` parameter is a string representing the unique
 * identifier of the appointment that needs to be rescheduled.
 * @param {string} userId - The `userId` parameter in the `rescheduleAppointment` function represents
 * the unique identifier of the user who is attempting to reschedule the appointment. This parameter is
 * used to verify the authorization of the user to modify the appointment. The function checks if the
 * `userId` matches the user associated with the appointment
 * @param data - {
 * @returns The `rescheduleAppointment` function returns a Promise that resolves to an `IAppointment`
 * object after updating the appointment details and adding a notification to a queue for sending an
 * appointment reschedule notification.
 */
static async rescheduleAppointment(
  appointmentId: string,
  userId: string,
  data: { newStartTime: Date; staffId?: string; serviceId?: string }
): Promise<IAppointment> {
  const { newStartTime, staffId, serviceId } = data;

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

  // If staffId or serviceId provided, validate and update
  if (staffId && staffId !== (appointment.staff as any)._id.toString()) {
    const staff = await Staff.findById(staffId).populate("user", "name email phone");
    if (!staff) throw createHttpError(404, "Staff not found");
    appointment.staff = new Types.ObjectId(staffId);
  }

  if (serviceId && serviceId !== (appointment.service as any)._id.toString()) {
    const service = await Service.findById(serviceId);
    if (!service) throw createHttpError(404, "Service not found");
    appointment.service = new Types.ObjectId(serviceId);
  }

  // We need the service duration for endTime, so get populated or fetch it
  let serviceDuration: number | undefined;
  if (isServicePopulated(appointment.service)) {
    serviceDuration = appointment.service.duration;
  } else {
    // fetch service duration if not populated
    const service = await Service.findById(appointment.service);
    if (!service) throw createHttpError(500, "Service duration not available");
    serviceDuration = service.duration;
  }

  const endTime = addMinutes(new Date(newStartTime), serviceDuration);

  // Check if new slot is free (exclude current appointment)
  const conflicting = await Appointment.findOne({
    staff: appointment.staff,
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

/* The above TypeScript code is using the `await` keyword to asynchronously add a notification to a
queue named `notificationQueue`. The notification being added is for sending an appointment
reschedule notification. The notification includes various details such as the user's email, phone,
and name from the `appointment` object, the service name if available, the staff user's name, the
old and new appointment times, and the staff user's email and phone if available. The values are
conditionally populated based on whether certain properties are available in the `appointment` and
`staffUser` objects. */
  await notificationQueue.add("sendAppointmentReschedule", {
    userEmail: appointment.user.email || "",
    userPhone: appointment.user.phone || "",
    userName: appointment.user.name,
    serviceName: isServicePopulated(appointment.service)
      ? appointment.service.name
      : "",
    staffName: isStaffUserPopulated(staffUser) ? staffUser.name : "",
    oldAppointmentTime: oldStartTime,
    newAppointmentTime: newStartTime,
    staffEmail: isStaffUserPopulated(staffUser) ? staffUser.email : "",
    staffPhone: isStaffUserPopulated(staffUser) ? staffUser.phone : "",
  });

  return appointment;
}


  /**
   * This static async function finds appointments for a specific user by their userId, populates
   * related fields, and sorts the results by startTime in descending order.
   * @param {string} userId - The `userId` parameter is a string representing the unique identifier of
   * a user for whom appointments need to be found.
   * @returns The `findForUser` method is returning a Promise that resolves to an array of
   * `IAppointment` objects. The method first checks if the `userId` is a valid ObjectId, and if not,
   * it throws an error with status code 400 and message "Invalid userId". If the `userId` is valid, it
   * then queries the `Appointment` collection to find appointments associated with the specified user
   */
  static async findForUser(userId: string): Promise<IAppointment[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, "Invalid userId");
    }
    return Appointment.find({ user: userId })
      .populate("service", "name duration")
      .populate({ path: "staff", populate: { path: "user", select: "name" } })
      .sort({ startTime: "desc" });
  }

  /**
   * The function `findAll` retrieves all appointments with populated service, staff, and user fields,
   * sorted by start time in descending order.
   * @returns This function `findAll` is returning a Promise that resolves to an array of
   * `IAppointment` objects. The function is querying the database to find all appointments, populating
   * the `service`, `staff`, and `user` fields with specific fields from related documents, and sorting
   * the results by the `startTime` field in descending order.
   */
  static async findAll(): Promise<IAppointment[]> {
    return Appointment.find()
      .populate("service", "name duration")
      .populate({ path: "staff", populate: { path: "user", select: "name" } })
      .populate("user", "name email")
      .sort({ startTime: "desc" });
  }

 /**
  * This function finds busy slots for a staff member on a specific date by querying the database for
  * appointments within that day.
  * @param {string} staffId - The `staffId` parameter is a string that represents the unique identifier
  * of a staff member for whom we want to find busy slots.
  * @param {string} date - The `date` parameter is a string representing a specific date for which you
  * want to find busy slots for a staff member.
  * @returns This function returns a list of appointments for a specific staff member on a given date
  * that are not cancelled. The appointments are filtered based on the start time falling within the
  * start and end of the specified date. The function returns only the `startTime` field of the
  * appointments in a lean format.
  */
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
