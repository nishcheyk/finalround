import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StaffService } from "./staff.service";

import { AppointmentService } from "../appointment/appointment.service";

export const createStaff = asyncHandler(async (req: Request, res: Response) => {
  const staff = await StaffService.create(req.body);
  res.status(201).json({ success: true, data: staff });
});

export const getStaff = asyncHandler(async (req: Request, res: Response) => {
  const staff = await StaffService.findAll();
  res.status(200).json({ success: true, data: staff });
});

export const getStaffById = asyncHandler(
  async (req: Request, res: Response) => {
    const staff = await StaffService.findById(req.params.id);
    res.status(200).json({ success: true, data: staff });
  }
);

export const updateStaff = asyncHandler(async (req: Request, res: Response) => {
  const staff = await StaffService.update(req.params.id, req.body);
  res.status(200).json({ success: true, data: staff });
});

export const deleteStaff = asyncHandler(async (req: Request, res: Response) => {
  await StaffService.delete(req.params.id);
  res.status(204).send();
});

export const getBusySlotsForStaff = async (req: Request, res: Response) => {
  try {
    const { staffId } = req.params;
    const { date } = req.query; // Expect date query param, e.g., '2023-10-02'

    if (!date) {
      return res
        .status(400)
        .json({ success: false, message: "Date query param required" });
    }
    // Find all appointments for the staff on that date which are booked (exclude cancelled)
    const busyAppointments = await AppointmentService.findBusySlotsForStaff(
      staffId,
      date as string
    );

    // Map to array of busy slot times (e.g. start times in ISO string)
    const busySlots = busyAppointments.map((appt) =>
      appt.startTime.toISOString()
    );

    res.status(200).json({ success: true, data: busySlots });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
