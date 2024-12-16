import { Router } from "express";
import dragController from "../Controllers/dragController.js";
const dragRouter=Router()

dragRouter.patch('/drag_cc/:active_id',dragController.dragChildToChild)
dragRouter.patch('/drag_cp/:active_id',dragController.dragChildToParent)
dragRouter.patch('/drag_ccg/:active_id',dragController.dragChildToChildGlobal)
dragRouter.patch('/drag_pp/:active_id',dragController.dragParentToParent)

export default dragRouter
