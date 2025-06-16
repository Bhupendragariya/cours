import { Router } from "express";
import {
  AddAdmin,
  AddCourse,
  getAdminDashboard,
  getEmployeeDashboard,
  getReferralSettings,
  login,
  purchaseCourse,
  refreshAccessToken,
  registerUser,
  updateReferral,
} from "../controllers/user.controller.js";
import { isAdminAuthenticated, isEmployeeAuthenticated } from "../middlewares/auth.js";

const router = Router();

router.get("/employee/:id", isEmployeeAuthenticated, getEmployeeDashboard);
router.post("/register", registerUser);
router.post("/login", login);
router.get("/admin", isAdminAuthenticated, getAdminDashboard);
router.post("/purchase", isEmployeeAuthenticated, purchaseCourse);
router.post("/addCourse", isAdminAuthenticated, AddCourse);
router.post("/newAdmin",  AddAdmin);
router.put("/addDiscount", isAdminAuthenticated, updateReferral);
router.get("/referral", isEmployeeAuthenticated, getReferralSettings);

router.post("/refresh-token", refreshAccessToken);

export default router;
