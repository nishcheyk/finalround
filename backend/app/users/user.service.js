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
exports.resetPasswordService =
  exports.logoutUserService =
  exports.refreshAccessTokenService =
  exports.loginUserService =
  exports.registerUserService =
    void 0;
const user_schema_1 = __importDefault(require("./user.schema"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshSecret";
const registerUserService = (dto) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield user_schema_1.default.findOne({
      email: dto.email,
    });
    if (existingUser) {
      const error = new Error("Email already exists");
      error.statusCode = 400;
      throw error;
    }
    const hash = yield bcrypt_1.default.hash(dto.password, 10);
    const user = new user_schema_1.default(
      Object.assign(Object.assign({}, dto), { password: hash }),
    );
    yield user.save();
    return user;
  });
exports.registerUserService = registerUserService;
const loginUserService = (dto) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_schema_1.default.findOne({ email: dto.email });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }
    const valid = yield bcrypt_1.default.compare(dto.password, user.password);
    if (!valid) {
      const error = new Error("Invalid credentials");
      error.statusCode = 401;
      throw error;
    }
    // Generate access token (short expiry)
    const token = jsonwebtoken_1.default.sign(
      { userId: user._id, isAdmin: user.isAdmin, email: user.email },
      JWT_SECRET,
      { expiresIn: "15m" },
    );
    // Generate refresh token (long expiry)
    const refreshToken = jsonwebtoken_1.default.sign(
      { userId: user._id },
      JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      },
    );
    // Save refresh token in user document (for revocation etc.)
    user.refreshTokens.push(refreshToken);
    yield user.save();
    return {
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
      },
    };
  });
exports.loginUserService = loginUserService;
const refreshAccessTokenService = (refreshToken) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const payload = jsonwebtoken_1.default.verify(
        refreshToken,
        JWT_REFRESH_SECRET,
      );
      const user = yield user_schema_1.default.findById(payload.userId);
      if (!user) {
        throw new Error("User not found");
      }
      if (!user.refreshTokens.includes(refreshToken)) {
        throw new Error("Refresh token revoked");
      }
      // Generate new access token
      const newToken = jsonwebtoken_1.default.sign(
        { userId: user._id, isAdmin: user.isAdmin, email: user.email },
        JWT_SECRET,
        { expiresIn: "15m" },
      );
      // Generate new refresh token (token rotation)
      const newRefreshToken = jsonwebtoken_1.default.sign(
        { userId: user._id },
        JWT_REFRESH_SECRET,
        {
          expiresIn: "7d",
        },
      );
      // Remove old refresh token and add new one
      user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
      user.refreshTokens.push(newRefreshToken);
      yield user.save();
      return { newToken, newRefreshToken };
    } catch (_a) {
      throw new Error("Invalid refresh token");
    }
  });
exports.refreshAccessTokenService = refreshAccessTokenService;
const logoutUserService = (refreshToken) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_schema_1.default.findOne({
      refreshTokens: refreshToken,
    });
    if (!user) return false;
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    yield user.save();
    return true;
  });
exports.logoutUserService = logoutUserService;
const resetPasswordService = (dto) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_schema_1.default.findOne({ email: dto.email });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    // Hash new password
    const hashedPassword = yield bcrypt_1.default.hash(dto.password, 10);
    user.password = hashedPassword;
    yield user.save();
    return { success: true, message: "Password reset successful" };
  });
exports.resetPasswordService = resetPasswordService;
