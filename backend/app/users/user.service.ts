import User, { IUser } from "./user.schema";
import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

interface RegisterDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshSecret";

export const registerUserService = async (dto: RegisterDTO): Promise<IUser> => {
  if (!dto.phone) {
    throw createHttpError(400, "Phone number is required");
  }
  const existingUser = await User.findOne({ email: dto.email });
  if (existingUser) {
    throw createHttpError(400, "Email already exists");
  }
  const user = new User(dto);
  await user.save();
  return user;
};

export const loginUserService = async (dto: LoginDTO) => {
  const user = await User.findOne({ email: dto.email });
  if (!user) {
    throw createHttpError(401, "Invalid credentials");
  }

  if (!user.password) {
    throw createHttpError(401, "Invalid credentials");
  }
  const valid = await user.comparePassword(dto.password);
  if (!valid) {
    throw createHttpError(401, "Invalid credentials");
  }

  // Generate access token (short expiry)
  const token = jwt.sign(
    { userId: user._id, isAdmin: user.isAdmin, email: user.email },
    JWT_SECRET,
    { expiresIn: "15m" }
  );

  // Generate refresh token (long expiry)
  const refreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  // Save refresh token in user document (for revocation etc.)
  user.refreshTokens = user.refreshTokens || [];
  user.refreshTokens.push(refreshToken);
  await user.save({ validateBeforeSave: false });

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
};

export const refreshAccessTokenService = async (refreshToken: string) => {
  try {
    const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as {
      userId: string;
    };
    const user = await User.findById(payload.userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.refreshTokens?.includes(refreshToken)) {
      throw new Error("Refresh token revoked");
    }

    // Generate new access token
    const newToken = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin, email: user.email },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Generate new refresh token (token rotation)
    const newRefreshToken = jwt.sign({ userId: user._id }, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    // Remove old refresh token and add new one
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    return { newToken, newRefreshToken };
  } catch (error) {
    throw createHttpError(401, "Invalid refresh token");
  }
};

export const logoutUserService = async (refreshToken: string) => {
  const user = await User.findOne({ refreshTokens: refreshToken });
  if (!user) return false;

  await User.updateOne(
    { _id: user._id },
    { $pull: { refreshTokens: refreshToken } }
  );
  return true;
};

interface ResetPasswordDTO {
  email: string;
  password: string;
}

export const resetPasswordService = async (dto: ResetPasswordDTO) => {
  const user = await User.findOne({ email: dto.email });
  if (!user) {
    throw createHttpError(404, "User not found");
  }

  // Hash new password
  user.password = dto.password;
  await user.save();

  return { success: true, message: "Password reset successful" };
};
