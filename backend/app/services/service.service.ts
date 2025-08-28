import createHttpError from "http-errors";
import Service, { IService } from "./service.schema";

export class ServiceService {
 /**
  * The function creates a new service instance with the provided data and saves it asynchronously.
  * @param data - The `data` parameter in the `create` method is of type `Partial<IService>`, which
  * means it is an object that may contain some or all of the properties defined in the `IService`
  * interface. It allows for creating a new `Service` instance with only a subset of the properties
  * @returns The `create` method is returning a Promise that resolves to an instance of `IService`.
  */
  static async create(data: Partial<IService>): Promise<IService> {
    const service = new Service(data);
    return service.save();
  }

  /**
   * The function `findAll` retrieves all services from the database and returns them in ascending
   * order by name.
   * @returns An array of IService objects sorted by the "name" field in ascending order. The objects
   * are returned as plain JavaScript objects (lean documents) instead of Mongoose documents.
   */
  static async findAll(): Promise<IService[]> {
    return Service.find().sort({ name: 1 }).lean();
  }

 /**
  * This static async function finds a service by its ID and returns it as a Promise.
  * @param {string} id - The `id` parameter is a string that represents the unique identifier of a
  * service that we want to find in the database.
  * @returns The `findById` method is returning a Promise that resolves to an object of type
  * `IService`. This object represents a service that was found in the database based on the provided
  * `id`. If the service is not found, a 404 error with the message "Service not found" is thrown.
  */
  static async findById(id: string): Promise<IService> {
    const service = await Service.findById(id).lean();
    if (!service) {
      throw createHttpError(404, "Service not found");
    }
    return service;
  }

  /**
   * This function updates a service record in a database by its ID and returns the updated service.
   * @param {string} id - The `id` parameter is a string that represents the unique identifier of the
   * service that needs to be updated.
   * @param data - The `data` parameter in the `update` function is of type `Partial<IService>`. This
   * means that it is an object that may contain some or all of the properties defined in the
   * `IService` interface. It allows you to update only specific properties of a service object without
   * having to provide
   * @returns The `update` function is returning a Promise that resolves to an updated `IService`
   * object.
   */
  static async update(id: string, data: Partial<IService>): Promise<IService> {
    const service = await Service.findByIdAndUpdate(id, data, { new: true });
    if (!service) throw createHttpError(404, "Service not found");
    return service;
  }

  /**
   * The static async delete function deletes a document from the database based on the provided id.
   * @param {string} id - The `id` parameter is a string that represents the unique identifier of the
   * item that you want to delete from the database.
   * @returns The `delete` method is returning the result of calling `Service.findByIdAndDelete(id)`.
   * This method likely deletes a document from a database collection based on the provided `id` and
   * returns the result of the deletion operation.
   */
  static async delete(id: string) {
    return Service.findByIdAndDelete(id);
  }
}
