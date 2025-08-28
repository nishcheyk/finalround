import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { AppointmentService } from "./appointment.service";
import { AuthenticatedUser } from "../types/express";

export const createAppointment = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const appointment = await AppointmentService.create(user.userId, req.body);
    res.status(201).json({ success: true, data: appointment });
  }
);

export const getUserAppointments = asyncHandler(
  async (req: Request, res: Response) => {
    const user = req.user as AuthenticatedUser;
    const appointments = await AppointmentService.findForUser(user.userId);
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
    res.status(200).json({ success: true, data: slots }); // data: { availableSlots: [], bookedSlots: [] }
  }
);
