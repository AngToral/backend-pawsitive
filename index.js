require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 3000

const { userRouter } = require('./routes/userRoutes')
const { postRouter } = require('./routes/postRoutes')
const { conversationRouter } = require('./routes/conversationRoutes')
const { commentRouter } = require('./routes/commentRoutes')
const { likeRouter } = require('./routes/likeRoutes')
const { followRouter } = require('./routes/followRoutes')
const { messageRouter } = require('./routes/messageRoutes')
const { feedRouter } = require('./routes/feedRoutes')
const { notificationRouter } = require('./routes/notificationRoutes')
const { initSocket } = require('./websockets/websocket')

const mongoose = require("mongoose")
const mongoDB = "mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@" + process.env.DB_SERVER + "/" + process.env.DB_NAME + "?retryWrites=true&w=majority";
async function main() {
    await mongoose.connect(mongoDB);
}
main().catch(err => console.log(err));

// Configuración de CORS
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'], // Añade aquí el origen de tu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}))

app.use(express.json())

// Middleware para logging de solicitudes
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
})

app.use('/user', userRouter)
app.use('/post', postRouter)
app.use('/chat', conversationRouter)
app.use('/', commentRouter)
app.use('/like', likeRouter)
app.use('/follow', followRouter)
app.use('/message', messageRouter)
app.use('/feed', feedRouter)
app.use('/notification', notificationRouter)

const server = app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    console.log("The database user is: ", process.env.DB_USER)
});

// Inicializar WebSocket después de que el servidor esté escuchando
initSocket(server);

module.exports = { app, server };