import { Router } from "express"
import userRouter from "./user.router.js"
import eventRouter from "./event.router.js"

const mainRouter = Router()

mainRouter.use("/user", userRouter) // use userRouter
mainRouter.use("/event", eventRouter) // use eventRouter

export default mainRouter