import express from "express";
import cookie from "cookie-parser"
import mainRouter from "./routes/main.routes.js";


const app = express()
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))

app.use(cookie())

app.use("/api/v1", mainRouter)

export default app