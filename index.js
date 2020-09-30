import { default as WebRTCServer }  from "./server.js";

const server = new WebRTCServer();
 
server.listen(port => {
 console.log(`Server is listening on http://localhost:${port}`);
});