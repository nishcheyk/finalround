import mongoose from "mongoose";
import Staff from "../staff/staff.schema";
import Service from "../services/service.schema";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/booking-app";

async function seedAvailability() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // Get all services
  const services = await Service.find();

  // Set demo availability for all staff
  const allStaff = await Staff.find();
  for (const staff of allStaff) {
    staff.availability = [
      { dayOfWeek: 1, startTime: "09:00", endTime: "17:00" }, // Monday
      { dayOfWeek: 2, startTime: "09:00", endTime: "17:00" }, // Tuesday
      { dayOfWeek: 3, startTime: "09:00", endTime: "17:00" }, // Wednesday
      { dayOfWeek: 4, startTime: "09:00", endTime: "17:00" }, // Thursday
      { dayOfWeek: 5, startTime: "09:00", endTime: "17:00" }, // Friday
    ];
    staff.services = services.map((s) => s._id);
    await staff.save();
  }

  console.log(
    "Seeded staff availability and assigned all services to all staff."
  );
  await mongoose.disconnect();
}

seedAvailability().catch((err) => {
  console.error(err);
  process.exit(1);
});
