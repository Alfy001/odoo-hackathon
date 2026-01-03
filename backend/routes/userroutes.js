import express from "express";
import { signup, login, logout, getUserById} from "../controllers/usercontroller.js";

const router = express.Router();

/**
 * Auth routes
 */
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me/:id", getUserById);

export default router;
