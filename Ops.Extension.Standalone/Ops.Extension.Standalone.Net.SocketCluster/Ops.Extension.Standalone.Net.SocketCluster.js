const http = op.require('http');
const socketClusterServer = op.require('socketcluster-server');

const
    exec = op.inTrigger("Trigger"),
    port = op.inInt("Port"),
    next = op.outTrigger("Next"),
    outStarted = op.outNumber("Started");

exec.onTriggered = () =>
{
    result.set(myNumber.get() * 100);
};

port.onChange=start;

let httpServer;
let agServer;

start();

function start()
{

    httpServer = http.createServer();
    agServer = socketClusterServer.attach(httpServer);

    console.log("agServer",agServer)


    (async () => {
      // Handle new inbound sockets.
      for await (let {socket} of agServer.listener('connection'))
      {

        (async () =>
        {
          // Set up a loop to handle and respond to RPCs for a procedure.
          for await (let req of socket.procedure('customProc')) {
            if (req.data.bad)
            {
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

    httpServer.listen(port.get());

}


