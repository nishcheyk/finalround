import mongoose from "mongoose";
import User from "../users/user.schema";
import Staff from "../staff/staff.schema";
import Service from "../services/service.schema";
import Appointment from "../appointment/appointment.schema";
import Notification from "../notifications/notification.schema";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/booking-app";

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear collections
  await Promise.all([
    User.deleteMany({}),
    Staff.deleteMany({}),
    Service.deleteMany({}),
    Appointment.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  // Create users
  const admin = new User({
    name: "Admin User",
    email: "admin@example.com",
    phone: "1111111111",
    password: "adminpass",
    role: "admin",
    isAdmin: true,
  });
  const staff1 = new User({
    name: "Staff One",
    email: "staff1@example.com",
    phone: "2222222222",
    password: "staffpass1",
    role: "staff",
    isAdmin: false,
  });
  const staff2 = new User({
    name: "Staff Two",
    email: "staff2@example.com",
    phone: "3333333333",
    password: "staffpass2",
    role: "staff",
    isAdmin: false,
  });
  const customer = new User({
    name: "Customer User",
    email: "customer@example.com",
    phone: "4444444444",
    password: "customerpass",
    role: "user",
    isAdmin: false,
  });
  await Promise.all([
    admin.save(),
    staff1.save(),
    staff2.save(),
    customer.save(),
  ]);

  // Create staff profiles
  const staffProfile1 = new Staff({
    user: staff1._id,
    services: [],
    availability: [],
  });
  const staffProfile2 = new Staff({
    user: staff2._id,
    services: [],
    availability: [],
  });
  await Promise.all([staffProfile1.save(), staffProfile2.save()]);

  // Create services
  const service1 = new Service({
    name: "Haircut",
    description: "Basic haircut",
    duration: 30,
    price: 20,
  });
  const service2 = new Service({
    name: "Shave",
    description: "Beard shave",
    duration: 15,
    price: 10,
  });
  await Promise.all([service1.save(), service2.save()]);

  // Assign services to staff
  staffProfile1.services = [service1._id, service2._id];
  staffProfile2.services = [service1._id];
  await Promise.all([staffProfile1.save(), staffProfile2.save()]);

  // Create appointments
  const now = new Date();
  const appointment1 = new Appointment({
    user: customer._id,
    staff: staffProfile1._id,
    service: service1._id,
    startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // tomorrow
    endTime: new Date(now.getTime() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // +30min
    status: "scheduled",
    notes: "First appointment",
  });
  const appointment2 = new Appointment({
    user: customer._id,
    staff: staffProfile2._id,
    service: service2._id,
    startTime: new Date(now.getTime() + 48 * 60 * 60 * 1000), // day after tomorrow
    endTime: new Date(now.getTime() + 48 * 60 * 60 * 1000 + 15 * 60 * 1000), // +15min
    status: "scheduled",
    notes: "Second appointment",
  });
  await Promise.all([appointment1.save(), appointment2.save()]);

  // Create notifications
  const notification = new Notification({
    title: "Welcome!",
    message: "System seeded successfully.",
    sender: admin._id,
    recipients: [admin._id, staff1._id, staff2._id, customer._id],
    isGlobal: true,
    type: "info",
    priority: "medium",
  });
  await notification.save();

  console.log("Seed data created.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
