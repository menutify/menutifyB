import { Router } from 'express'
import { subObject } from '../Controllers/subController.js'

const subRouter = Router()

subRouter.get('/', subObject.getAllSubs)

subRouter.get('/:id_user', subObject.getOneSub)

subRouter.delete('/:id_user', subObject.deleteSub)

export default subRouter
