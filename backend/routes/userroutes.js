import express from "express";
import { signup, login, logout, getUserById, forgotPasswordOtp, resetPasswordWithOtp} from "../controllers/usercontroller.js";

const router = express.Router();

/**
 * Auth routes
 */
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me/:id", getUserById);
router.post("/forgot-password-otp", forgotPasswordOtp);
router.post("/reset-password-otp", resetPasswordWithOtp);

export default router;
