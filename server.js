import express from "express";
import socketIO from "socket.io";
import { createServer } from "http";

const DEFAULT_PORT = process.env.PORT || 5000;

class WebRTCServer {
    constructor() {
        this.init()
    }

    init() {
        this.app = express();
        this.httpServer = createServer(this.app);
        this.io = socketIO(this.httpServer);

        this.activeSockets = []

        this.configureApp()
        this.socketConnection()
    }

    configureApp() {
        this.app.use(express.static('public'));
    }

    socketConnection() {
        this.io.on("connection", socket => {
            console.log(socket.id + ' connected')
            const existingSocket = this.activeSockets.find(
                existingSocket => existingSocket === socket.id
            );
        
            if (!existingSocket) {
                this.activeSockets.push(socket.id);
        
                socket.emit("update-user-list", {
                    users: this.activeSockets.filter(
                        existingSocket => existingSocket !== socket.id
                    )
                });
        
                socket.broadcast.emit("update-user-list", {
                    users: [socket.id]
                });
            }

            socket.on("request-call", data => {
                socket.to(data.to).emit("call-requested", {
                    socket: socket.id
                });
            });

            socket.on("reject-call", data => {
                socket.to(data.from).emit("call-rejected", {
                    socket: socket.id
                });
            });

            socket.on("call-user", data => {
                socket.to(data.to).emit("call-made", {
                    offer: data.offer,
                    socket: socket.id
                });
            });

            socket.on("make-answer", data => {
                socket.to(data.to).emit("answer-made", {
                    socket: socket.id,
                    answer: data.answer
                });
            });

            socket.on("disconnect", () => {
                this.activeSockets = this.activeSockets.filter(
                    existingSocket => existingSocket !== socket.id
                );
                
                socket.broadcast.emit("remove-user", {
                    socketId: socket.id
                });
            });
        });
    }

    listen(callback) {
        this.httpServer.listen(DEFAULT_PORT, () =>
            callback(DEFAULT_PORT)
        );
    }
}

export default WebRTCServer;