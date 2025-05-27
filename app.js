require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 3000

const { userRouter } = require('./routes/userRoutes')
const { postRouter } = require('./routes/postRoutes')

const mongoose = require("mongoose")
const mongoDB = "mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@" + process.env.DB_SERVER + "/" + process.env.DB_NAME + "?retryWrites=true&w=majority";
async function main() {
    await mongoose.connect(mongoDB);
}
main().catch(err => console.log(err));

app.use(cors())
app.use(express.json())

app.use('/user', userRouter)
app.use('/post', postRouter)

const server = app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    console.log("The database user is: ", process.env.DB_USER)
});

module.exports = { app, server };