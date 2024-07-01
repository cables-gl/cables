// vars
let stack = [];
let uuid = CABLES.uuid();

// inputs
let startPort = op.inTriggerButton("Start Task");
let stopPort = op.inTriggerButton("End Task");

// listeners
startPort.onTriggered = startTask;
stopPort.onTriggered = stopTask;

function startTask()
{
    let id = uuid + " (" + (stack.length + 1) + ")";
    let loadingId = op.patch.loading.start("task", id);
    if (CABLES.UI)
    {
        gui.jobs().start({ "id": loadingId, "title": "loading task " + id });
    }

    stack.push(loadingId);
}

function stopTask()
{
    let loadingId = stack.pop();
    op.patch.loading.finished(loadingId);
    if (CABLES.UI)
    {
        gui.jobs().finish(loadingId);
    }
}
