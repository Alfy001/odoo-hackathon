import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import { transporter } from "../utils/mailer.js";

const JWT_SECRET = process.env.JWT_SECRET;
const otpStore = new Map();
// --------------------
// Helpers
// --------------------
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const isValidPassword = (password) => {
  return typeof password === "string" && password.length >= 8;
};

const isValidPhone = (phone) => {
  if (!phone) return true; // optional
  const regex = /^[+]?[\d\s-]{8,15}$/;
  return regex.test(phone);
};

// --------------------
// SIGNUP
// --------------------
export const signup = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, city } = req.body;

    // 1️⃣ Required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 2️⃣ Email validation
    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // 3️⃣ Password validation
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    // 4️⃣ Phone validation
    if (!isValidPhone(phoneNumber)) {
      return res.status(400).json({
        message: "Invalid phone number format",
      });
    }

    // 5️⃣ Check existing user (email)
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // 6️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7️⃣ Create user
    const user = await prisma.user.create({
      data: {
        name: name?.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        phoneNumber,
        city,
      },
    });

    // 8️⃣ Response
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        city: user.city,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Internal server error during signup",
    });
  }
};

// --------------------
// LOGIN
// --------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Required fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 2️⃣ Email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // 3️⃣ Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // ❗ Important: same error for email & password (security)
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 4️⃣ Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 5️⃣ JWT secret check
    if (!JWT_SECRET) {
      return res.status(500).json({
        message: "JWT secret not configured",
      });
    }

    // 6️⃣ Generate token
    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 7️⃣ Response
    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        phoneNumber: user.phoneNumber,
        city: user.city,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error during login",
    });
  }
};

// --------------------
// LOGOUT
// --------------------
export const logout = async (req, res) => {
  // Stateless JWT → frontend removes token
  return res.status(200).json({
    message: "Logout successful",
  });
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        city: true,
        createdAt: true,

        // ✅ Include previous trips
        trips: {
          orderBy: {
            createdAt: "desc", // latest trips first
          },
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            isPublic: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get user by id error:", error);
    return res.status(500).json({
      message: "Failed to fetch user",
    });
  }
};



export const forgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // 🔐 Same response even if user doesn't exist
    if (!user) {
      return res.status(200).json({
        message: "If the email exists, OTP has been sent",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 min
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      html: `
        <h3>Password Reset</h3>
        <p>Your OTP is:</p>
        <h2>${otp}</h2>
        <p>Valid for 10 minutes.</p>
      `,
    });

    return res.status(200).json({
      message: "OTP sent to email",
    });
  } catch (error) {
    console.error("Forgot password OTP error:", error);
    return res.status(500).json({
      message: "Failed to send OTP",
    });
  }
};

export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Missing fields" });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const record = otpStore.get(email);

    if (
      !record ||
      record.otp !== otp ||
      record.expiresAt < Date.now()
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // 🔥 OTP is one-time use
    otpStore.delete(email);

    return res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password OTP error:", error);
    return res.status(500).json({
      message: "Failed to reset password",
    });
  }
};
