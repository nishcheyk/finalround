"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const successResponse = (res, data, message = "Success") => {
  res.status(200).json({ status: "success", message, data });
};
exports.successResponse = successResponse;
const errorResponse = (res, message = "Error", statusCode = 500) => {
  res.status(statusCode).json({ status: "error", message });
};
exports.errorResponse = errorResponse;
