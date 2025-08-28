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

/**
 * The function `registerUserService` registers a new user by checking for existing users and saving
 * the user details if they do not already exist.
 * @param {RegisterDTO} dto - The `dto` parameter in the `registerUserService` function stands for Data
 * Transfer Object. It is an object that contains the data necessary for registering a new user, such
 * as email, phone number, and other relevant information.
 * @returns The `registerUserService` function is returning a Promise that resolves to an `IUser`
 * object after successfully registering a new user based on the provided `RegisterDTO` data.
 */
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

/**
 * The `loginUserService` function handles user authentication by verifying credentials, generating
 * access and refresh tokens, and returning user information.
 * @param {LoginDTO} dto - The `dto` parameter in the `loginUserService` function stands for Data
 * Transfer Object. It is an object that contains the necessary data for the login process, such as the
 * user's email and password. In this case, it is of type `LoginDTO`, which likely includes properties
 * for email and
 * @returns The `loginUserService` function returns an object containing a `token`, `refreshToken`, and
 * `user` information. The `token` is a JWT access token with a short expiry, the `refreshToken` is a
 * JWT refresh token with a longer expiry, and the `user` object includes the user's ID, name, email,
 * phone, and isAdmin status.
 */
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

/**
 * The function `refreshAccessTokenService` verifies a refresh token, generates a new access token and
 * refresh token, and updates the user's refresh tokens.
 * @param {string} refreshToken - The `refreshToken` parameter is a string that is used to verify and
 * refresh the user's access token. It is generated when the user logs in or requests a new access
 * token. The `refreshToken` allows the user to obtain a new access token without having to log in
 * again, providing a
 * @returns The `refreshAccessTokenService` function returns an object containing `newToken` and
 * `newRefreshToken` if the refresh token is valid and the user is found. If there is an error during
 * the process, it throws an HTTP error with status code 401 and message "Invalid refresh token".
 */
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

/**
 * The function logoutUserService asynchronously removes a refresh token from a user's list of refresh
 * tokens in a MongoDB database.
 * @param {string} refreshToken - A refresh token is a special kind of token that is used by
 * applications to obtain a new access token after the previous access token has expired. It is
 * typically used in authentication processes to maintain user sessions without requiring the user to
 * re-enter their credentials.
 * @returns The `logoutUserService` function returns a boolean value - `true` if the user with the
 * provided refresh token was found and the refresh token was successfully removed from the user's list
 * of refresh tokens, and `false` if the user was not found.
 */
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

/**
 * The function `resetPasswordService` resets the password for a user based on the provided email and
 * new password.
 * @param {ResetPasswordDTO} dto - The `dto` parameter in the `resetPasswordService` function stands
 * for Data Transfer Object. It is an object that contains the necessary information for resetting a
 * user's password, such as the user's email and the new password they want to set.
 * @returns The `resetPasswordService` function returns an object with properties `success` set to
 * `true` and `message` set to "Password reset successful" if the password reset is successful.
 */
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
