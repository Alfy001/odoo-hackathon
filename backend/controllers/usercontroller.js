import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET;

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
