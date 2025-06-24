import { Router } from "express";
import {
  editAccount,
  getEmployeeDashboard,
  getReferralSettings,
  getUserProfile,
  getWallet,
  login,
  order,
  purchaseCourse,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";
import {  isEmployeeAuthenticated } from "../middlewares/auth.js";

const router = Router();

router.get("/employee", isEmployeeAuthenticated, getEmployeeDashboard);

router.post("/register", registerUser);

router.post("/login", login);

router.post("/purchase", isEmployeeAuthenticated, purchaseCourse);

router.get("/referral", isEmployeeAuthenticated, getReferralSettings);

router.get("/get-Profile", isEmployeeAuthenticated, getUserProfile);

router.get("/order", isEmployeeAuthenticated, order);

router.get("/getWallet", isEmployeeAuthenticated, getWallet);

router.get("/editAccount", isEmployeeAuthenticated, editAccount);


router.post("/refresh-token", refreshAccessToken);

export default router;
