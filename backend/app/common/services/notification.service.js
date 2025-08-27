"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationQueue = void 0;
const bull_queue_service_1 = __importDefault(require("./bull-queue.service"));
exports.notificationQueue = bull_queue_service_1.default;
const sms_service_1 = require("./sms.service");
bull_queue_service_1.default.process("sendNotification", (job) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const {
      email,
      phone,
      subject,
      message,
      qrCode,
      seatNumbers,
      seatCategories,
      reservationName,
    } = job.data;
    if (phone) {
      try {
        yield (0, sms_service_1.sendSMS)(
          phone,
          message ||
            `Booking confirmed for ${reservationName}. Seats: ${seatNumbers.join(", ")}`,
        );
      } catch (error) {
        console.error(`Failed to send SMS to ${phone}:`, error);
      }
    }
  }),
);
