import createHttpError from "http-errors";
import Staff, { IStaff } from "./staff.schema";

export class StaffService {
 /**
  * The function creates a new staff member with the provided data and saves it.
  * @param data - The `data` parameter in the `create` function is of type `Partial<IStaff>`, which
  * means it is an object that may contain some or all of the properties defined in the `IStaff`
  * interface. It allows for creating a new `Staff` object with only a subset of the
  * @returns The `create` method is returning a Promise that resolves to an instance of `IStaff` after
  * saving the `staff` object.
  */
  static async create(data: Partial<IStaff>): Promise<IStaff> {
    const staff = new Staff(data);
    return staff.save();
  }

/**
 * The function `findAll` retrieves all staff members with their associated user information and
 * services in a lean format.
 * @returns An array of staff objects with populated user fields containing only the "name" and "email"
 * properties, and populated services fields. The data is returned in a lean format.
 */
  static async findAll(): Promise<IStaff[]> {
    return Staff.find()
      .populate("user", "name email")
      .populate("services")
      .lean();
  }

/**
 * The function findById asynchronously retrieves a staff member by their ID, populating their user and
 * services fields and throwing a 404 error if the staff member is not found.
 * @param {string} id - The `id` parameter in the `findById` method is a string representing the unique
 * identifier of the staff member that you want to retrieve from the database.
 * @returns The `findById` method is returning a Promise that resolves to an object of type `IStaff`.
 * This object represents a staff member and includes their user information (name and email) and
 * services they provide. If the staff member with the specified `id` is not found, a 404 error is
 * thrown with the message "Staff not found".
 */
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

 /**
  * The function updates a staff member's information in a database and returns the updated staff
  * object.
  * @param {string} id - The `id` parameter is a string that represents the unique identifier of the
  * staff member that you want to update in the database.
  * @param data - The `data` parameter in the `update` function represents a partial object of type
  * `IStaff`. It is used to update the properties of a staff member with the provided `id`. The
  * properties that are included in the `data` object will be updated in the staff member's record in
  * the
  * @returns The `update` function is returning a Promise that resolves to an updated `IStaff` object.
  */
  static async update(id: string, data: Partial<IStaff>): Promise<IStaff> {
    const staff = await Staff.findByIdAndUpdate(id, data, { new: true });
    if (!staff) throw createHttpError(404, "Staff not found");
    return staff;
  }

 /**
  * The function `delete` deletes a staff member by their ID asynchronously.
  * @param {string} id - The `id` parameter in the `delete` function is a string that represents the
  * unique identifier of the staff member that you want to delete from the database.
  * @returns The `delete` method is returning the result of calling `Staff.findByIdAndDelete(id)`,
  * which is a promise that resolves to the deleted document.
  */
  static async delete(id: string) {
    return Staff.findByIdAndDelete(id);
  }
}
