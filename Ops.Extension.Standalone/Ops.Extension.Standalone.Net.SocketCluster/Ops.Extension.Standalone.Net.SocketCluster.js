const
    exec = op.inTrigger("Trigger"),
    myNumber = op.inFloat("Number"),
    next = op.outTrigger("Next"),
    result = op.outNumber("Result");

exec.onTriggered = () =>
{
    result.set(myNumber.get() * 100);
};


const http = op.require('http');
const socketClusterServer = op.require('socketcluster-server');

let httpServer = http.createServer();
let agServer = socketClusterServer.attach(httpServer);

(async () => {
  // Handle new inbound sockets.
  for await (let {socket} of agServer.listener('connection')) {

    (async () => {
      // Set up a loop to handle and respond to RPCs for a procedure.
      for await (let req of socket.procedure('customProc')) {
        if (req.data.bad) {
          let error = new Error('Server failed to execute the procedure');
          error.name = 'BadCustomError';
          req.error(error);
        } else {
          req.end('Success');
        }
      }
    })();

    (async () => {
      // Set up a loop to handle remote transmitted events.
      for await (let data of socket.receiver('customRemoteEvent')) {
        // ...

      }
    })();

  }
})();

httpServer.listen(8001);