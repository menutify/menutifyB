import { Router } from "express";
import { getMenu } from "../Controllers/appController.js";

const appRouter=Router()

appRouter.get('/:domain',getMenu)

export default appRouter