const inApiKey = op.inString("API-Key");
const inAuthUrl = op.inString("Auth URL");
const inActive = op.inBool("Active", false);
const inPingInterval = op.inInt("Ping Interval", 10000)
const outAbly = op.outObject("Connection", null, "Ably");
const outConnected = op.outBoolNum("Connected", false);
const outConnectionId = op.outString("Connection Id");
const outClientId = op.outString("Client Id");

let ablyInstance = null;

inAuthUrl.onChange =
inApiKey.onChange = () => {
    if(!inActive.get()) {
        disconnect();
    }else{
       connect();
    }
};

inActive.onChange = () => {
    if(!inActive.get()) {
        disconnect();
    }else{
       connect();
    }
}

function connect() {
    if(!inActive.get()) return;

    outConnected.set(false);
    if(inApiKey.get() || inAuthUrl.get()) {
        const pingInterval = inPingInterval.get() || 10000;
        const clientId = CABLES.uuid();
        const ablyOptions = {
            "transportParams": { "heartbeatInterval": pingInterval },
            "clientId": clientId,
            "autoConnect": false
        }
        if(inAuthUrl.get()) {
            ablyOptions.authUrl = inAuthUrl.get();
        }else{
            ablyOptions.key = inApiKey.get()
        }
        ablyInstance = new Ably.Realtime(ablyOptions);
        ablyInstance.connection.on('connected', () => {
            outConnectionId.set(null);
            op.log("ID", ablyInstance.connection.id);
            outConnectionId.set(ablyInstance.connection.id);
        });
        ablyInstance.connect();
        outClientId.set(clientId);
        outAbly.set(ablyInstance);
        outConnected.set(true);

    }
}

function disconnect() {
    // if(ablyInstance && ablyInstance.connection) ablyInstance.connection.close();
    outConnected.set(false);
    ablyInstance = null;
}