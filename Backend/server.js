const app = require("./app");
const http = require("http");
const PORT = process.env.PORT;
const {initializeSocket} = require('./socket')

const server = http.createServer(app);

initializeSocket(server)

server.listen(PORT,()=>{
    console.log(`Server started on ${PORT}`)
})