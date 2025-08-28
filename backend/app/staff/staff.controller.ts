import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { StaffService } from "./staff.service";

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
