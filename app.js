
const express = require("express")
const loggerMiddleware = require("./middleware/loggerMiddleware")
const scheduleRoute = require("./routes/scheduleRoute")

const app = express()

app.use(express.json())
app.use(loggerMiddleware)

app.use("/", scheduleRoute)

app.listen(3000, () => {
    console.log("server running on port 3000")
})