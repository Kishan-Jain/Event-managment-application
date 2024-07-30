import dotenv from "dotenv"
import app from "./app.js"
import connectDB from "./db/connectDb.js"

// env configration
dotenv.config({
    path: "./.env",
  });
  

// variable declareration
const port = process.env.PORT


// connect to database and listen server
connectDB()
.then(
    app.listen(port, () =>{
        console.log(`server is listen on http://localhost:${port}`)
    })
)
.catch((error) => {
    console.log(`${error.messege || "DB-Server Connection faild"}`)
})
