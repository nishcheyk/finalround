import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { ServiceService } from "./service.service";

export const createService = asyncHandler(
  async (req: Request, res: Response) => {
    const service = await ServiceService.create(req.body);
    res.status(201).json({ success: true, data: service });
  }
);

export const getServices = asyncHandler(async (req: Request, res: Response) => {
  const services = await ServiceService.findAll();
  res.status(200).json({ success: true, data: services });
});

export const getServiceById = asyncHandler(
  async (req: Request, res: Response) => {
    const service = await ServiceService.findById(req.params.id);
    res.status(200).json({ success: true, data: service });
  }
);

export const updateService = asyncHandler(
  async (req: Request, res: Response) => {
    const service = await ServiceService.update(req.params.id, req.body);
    res.status(200).json({ success: true, data: service });
  }
);

export const deleteService = asyncHandler(
  async (req: Request, res: Response) => {
    await ServiceService.delete(req.params.id);
    res.status(204).send();
  }
);
