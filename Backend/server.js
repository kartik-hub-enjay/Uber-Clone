const app = require("./app");
const http = require("http");
const PORT = process.env.PORT;

const server = http.createServer(app);

server.listen(PORT,()=>{
    console.log(`Server started on ${PORT}`)
})