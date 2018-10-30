// vars
var stack = [];
var uuid = CABLES.uuid();

// inputs
var startPort = op.inTriggerButton('Start Task');
var stopPort = op.inTriggerButton('End Task');

// listeners
startPort.onTriggered = startTask;
stopPort.onTriggered = stopTask;

function startTask() {
    var id = uuid + ' (' + (stack.length + 1) + ')';
    var loadingId = op.patch.loading.start('task', id);
    if(CABLES.UI) {
        gui.jobs().start({id: loadingId, title: 'loading task ' + id});    
    }
    
    stack.push(loadingId);
}

function stopTask() {
    var loadingId = stack.pop();
    op.patch.loading.finished(loadingId);
    if(CABLES.UI) {
        gui.jobs().finish(loadingId);
    }
}
