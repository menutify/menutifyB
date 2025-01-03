import { Router } from 'express'
import { subObject } from '../Controllers/subController.js'
import { verifyExistJWT } from '../middleware/checkJWT.js'

const subRouter = Router()

subRouter.get('/',verifyExistJWT, subObject.getOneSub)


// subRouter.get('/:id_user', subObject.getOneSub)

// subRouter.delete('/:id_user', subObject.deleteSub)

export default subRouter
