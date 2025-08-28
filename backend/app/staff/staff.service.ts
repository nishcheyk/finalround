import createHttpError from "http-errors";
import Staff, { IStaff } from "./staff.schema";

export class StaffService {
  static async create(data: Partial<IStaff>): Promise<IStaff> {
    const staff = new Staff(data);
    return staff.save();
  }

  static async findAll(): Promise<IStaff[]> {
    return Staff.find()
      .populate("user", "name email")
      .populate("services")
      .lean();
  }

  static async findById(id: string): Promise<IStaff> {
    const staff = await Staff.findById(id)
      .populate("user", "name email")
      .populate("services")
      .lean();
    if (!staff) {
      throw createHttpError(404, "Staff not found");
    }
    return staff;
  }

  static async update(id: string, data: Partial<IStaff>): Promise<IStaff> {
    const staff = await Staff.findByIdAndUpdate(id, data, { new: true });
    if (!staff) throw createHttpError(404, "Staff not found");
    return staff;
  }

  static async delete(id: string) {
    return Staff.findByIdAndDelete(id);
  }
}
