import { Router } from 'express'
import { subObject } from '../Controllers/subController.js'

const subRouter = Router()

subRouter.get('/',subObject.getSubs)

subRouter.post('/', subObject.postSub)

subRouter.put('/:id', subObject.putSub)

export default subRouter
