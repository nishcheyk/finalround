import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AppointmentService } from "./appointment.service";
import { AuthenticatedUser } from "../types/express";
import createHttpError from "http-errors";
import { NextFunction } from "express";

export const createAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const appointment = await AppointmentService.create(user.userId, req.body);
    res.status(201).json({ success: true, data: appointment });
  }
);

export const cancelAppointment = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as AuthenticatedUser;
      if (!req.params.appointmentId) {
        console.error("Missing appointmentId in request params");
        throw createHttpError(400, "Appointment ID is required");
      }
      console.log(
        `Attempting to cancel appointment ID: ${req.params.appointmentId} for user: ${user.userId}`
      );

      const appointment = await AppointmentService.cancelAppointment(
        req.params.appointmentId,
        user.userId
      );

      console.log(`Appointment cancelled successfully: `);

      res.status(200).json({ success: true, data: appointment });
    } catch (error) {
      console.error("Error in cancelAppointment controller:", error);
      next(error); // Pass error to global error handler
    }
  }
);

export const rescheduleAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const { newStartTime } = req.body;
    const appointment = await AppointmentService.rescheduleAppointment(
      req.params.appointmentId,
      user.userId,
      new Date(newStartTime)
    );
    res.status(200).json({ success: true, data: appointment });
  }
);

export const getUserAppointments = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const appointments = await AppointmentService.findForUser(user.userId);
    res.status(200).json({ success: true, data: appointments });
  }
);

export const getAllAppointments = asyncHandler(
  async (req: Request, res: Response) => {
    const appointments = await AppointmentService.findAll();
    res.status(200).json({ success: true, data: appointments });
  }
);

export const checkAvailability = asyncHandler(
  async (req: Request, res: Response) => {
    const { staffId, serviceId, date } = req.body;
    const slots = await AppointmentService.getAvailability(
      staffId,
      serviceId,
      new Date(date)
    );
    res.status(200).json({ success: true, data: slots });
  }
);
