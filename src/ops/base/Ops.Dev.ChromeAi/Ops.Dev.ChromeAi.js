let supported = !!window.ai;

const
    inStr = op.inString("Prompt", "Who are you?"),
    exec = op.inTriggerButton("Trigger"),
    outStr = op.outString("Result"),
    outWorking = op.outBoolNum("Working", false),
    outSupported = op.outBoolNum("Supported", supported);

console.log("supported", supported, supported ? 1 : 0);

exec.onTriggered = update;

let model = null;
start();

op.init = () =>
{
    outSupported.set(supported);
};

async function start()
{
    if (!supported) return;
    model = await window.ai.createTextSession();
}

async function update()
{
    if (!model || !supported) return;
    outWorking.set(true);
    const answer = await model.prompt(inStr.get());
    outStr.set(answer);
    outWorking.set(false);
}
