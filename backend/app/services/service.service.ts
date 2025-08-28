import createHttpError from "http-errors";
import Service, { IService } from "./service.schema";

export class ServiceService {
  static async create(data: Partial<IService>): Promise<IService> {
    const service = new Service(data);
    return service.save();
  }

  static async findAll(): Promise<IService[]> {
    return Service.find().sort({ name: 1 }).lean();
  }

  static async findById(id: string): Promise<IService> {
    const service = await Service.findById(id).lean();
    if (!service) {
      throw createHttpError(404, "Service not found");
    }
    return service;
  }

  static async update(id: string, data: Partial<IService>): Promise<IService> {
    const service = await Service.findByIdAndUpdate(id, data, { new: true });
    if (!service) throw createHttpError(404, "Service not found");
    return service;
  }

  static async delete(id: string) {
    return Service.findByIdAndDelete(id);
  }
}
