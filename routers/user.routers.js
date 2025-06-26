import { Router } from "express";
import {
  editAccount,
  getEmployeeDashboard,
  getReferralSettings,
  getUserProfile,
  getWallet,
  login,
  logoutUser,
  order,
  purchaseCourse,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";

import { AddAdmin, AddCourse, addWalletAmount, allOrder, approveOfflineOrder, getAdminDashboard, updateReferral,   } from "../controllers/admin.controller.js";
import { authorizeRoles, isAuthenticated } from "../middlewares/auth.js";


const router = Router();

router.get("/employee", isAuthenticated, getEmployeeDashboard);

router.post("/register", registerUser);

router.post("/login", login);

router.post("/logout", logoutUser);


router.post("/purchase", isAuthenticated, purchaseCourse);

router.get("/referral", isAuthenticated, getReferralSettings);

router.get("/get-Profile", isAuthenticated, getUserProfile);

router.get("/order", isAuthenticated, order);

router.get("/getWallet", isAuthenticated, getWallet);

router.get("/editAccount", isAuthenticated, editAccount);



router.post("/refresh-token", refreshAccessToken);



router.post("/newAdmin",isAuthenticated, authorizeRoles, AddAdmin);

router.get("/all-employee", isAuthenticated,authorizeRoles, getAdminDashboard);

router.post("/addCourse", isAuthenticated, authorizeRoles, AddCourse);

router.put("/addDiscount", isAuthenticated, authorizeRoles, updateReferral);

router.post("/add-wallet/:id", isAuthenticated, authorizeRoles, addWalletAmount);

router.put("/approve-order/:orderId", isAuthenticated, authorizeRoles, approveOfflineOrder);

router.get("/allOrder", isAuthenticated, authorizeRoles, allOrder);

export default router;
