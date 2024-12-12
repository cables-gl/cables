const
    inExec = op.inTrigger("Render"),
    inNode = op.inInt("Node Index"),
    next = op.outTrigger("Next");

const cgl = op.patch.cgl;

inExec.onTriggered = function ()
{
    if (!cgl.frameStore.currentScene) return;

    let idx = inNode.get();
    idx = Math.max(0, idx);
    idx = Math.min(cgl.frameStore.currentScene.nodes.length - 1, idx);

    let n = cgl.frameStore.currentScene.nodes[idx];

    cgl.pushModelMatrix();

    n.transform(cgl);
    next.trigger();

    cgl.popModelMatrix();
};
