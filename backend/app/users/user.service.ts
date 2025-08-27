import User, { IUser } from "./user.schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

interface RegisterDTO {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

interface LoginDTO {
  email: string;
  password: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshSecret";

export const registerUserService = async (dto: RegisterDTO): Promise<IUser> => {
  const existingUser = await User.findOne({ email: dto.email });
  if (existingUser) {
    const error: any = new Error("Email already exists");
    error.statusCode = 400;
    throw error;
  }

  const hash = await bcrypt.hash(dto.password, 10);
  const user = new User({ ...dto, password: hash });
  await user.save();
  return user;
};

export const loginUserService = async (dto: LoginDTO) => {
  const user = await User.findOne({ email: dto.email });
  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 401;
    throw error;
  }

  const valid = await bcrypt.compare(dto.password, user.password);
  if (!valid) {
    const error: any = new Error("Invalid credentials");
    error.statusCode = 401;
    throw error;
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
  user.refreshTokens.push(refreshToken);
  await user.save();

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
    if (!user.refreshTokens.includes(refreshToken)) {
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
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();
    
    return { newToken, newRefreshToken };
  } catch {
    throw new Error("Invalid refresh token");
  }
};

export const logoutUserService = async (refreshToken: string) => {
  const user = await User.findOne({ refreshTokens: refreshToken });
  if (!user) return false;
  user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
  await user.save();
  return true;
};

interface ResetPasswordDTO {
  email: string;
  password: string;
}

export const resetPasswordService = async (dto: ResetPasswordDTO) => {
  const user = await User.findOne({ email: dto.email });
  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(dto.password, 10);
  user.password = hashedPassword;
  await user.save();

  return { success: true, message: "Password reset successful" };
};
