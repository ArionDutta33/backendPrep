//repeat
import { Router } from "express";
import { regsiterUser } from "../controller/user.controller.js";
const router = Router()
router.route("/regsiter").post(regsiterUser)


export default router;  