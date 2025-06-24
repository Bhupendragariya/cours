import { Router } from "express";
import { isAdminAuthenticated } from "../middlewares/auth.js";
import { AddAdmin, AddCourse, addWalletAmount, allOrder, approveOfflineOrder, getAdminDashboard, updateReferral,   } from "../controllers/admin.controller.js";
import { refreshAccessToken } from "../controllers/user.controller.js";


const router = Router();

router.post("/newAdmin",  AddAdmin);

router.get("/all-employee", isAdminAuthenticated, getAdminDashboard);

router.post("/addCourse", isAdminAuthenticated, AddCourse);

router.put("/addDiscount", isAdminAuthenticated, updateReferral);

router.post("/add-wallet/:id", isAdminAuthenticated, addWalletAmount);

router.put("/approve-order/:orderId", isAdminAuthenticated, approveOfflineOrder);

router.get("/allOrder", isAdminAuthenticated, allOrder);


router.post("/refresh-token", refreshAccessToken);


export default router;