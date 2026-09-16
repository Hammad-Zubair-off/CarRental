import express from "express";
import { protect, requireOwner } from "../middleware/auth.js";
import { addCar, changeRoleToOwner, deleteCar, getDashboardData, getOwnerCars, toggleCarAvailability, updateUserImage } from "../controllers/ownerController.js";
import upload from "../middleware/multer.js";

const ownerRouter = express.Router();

ownerRouter.post("/change-role", protect, changeRoleToOwner)
ownerRouter.post("/add-car", protect, requireOwner, upload.single("image"), addCar)
ownerRouter.get("/cars", protect, requireOwner, getOwnerCars)
ownerRouter.post("/toggle-car", protect, requireOwner, toggleCarAvailability)
ownerRouter.post("/delete-car", protect, requireOwner, deleteCar)

ownerRouter.get('/dashboard', protect, requireOwner, getDashboardData)
ownerRouter.post('/update-image', protect, upload.single("image"), updateUserImage)

export default ownerRouter;
