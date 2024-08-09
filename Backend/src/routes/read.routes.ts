import { Router } from "express";
import {
    readGithubRepository,
} from '../controllers/read.controller.js'
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/readGithubRepository").post(verifyJWT, readGithubRepository);

export default router