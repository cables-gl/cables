const
    inExec = op.inTrigger("Execute"),
    outNext = op.outTrigger("Childs"),
    outUsed = op.outNumber("Time Used");

inExec.onTriggered = update;

let lastUpdateTitle=0
function updateTitle()
{
    op.setUiAttrib({ "extendTitle": (Math.round(outUsed.get()*100)/100)+"ms" });

lastUpdateTitle=performance.now()
  }

function update()
{
    const startTime = performance.now();
    outNext.trigger();
    const used = performance.now() - startTime;
    outUsed.set(used);
if(performance.now()-lastUpdateTitle>300)updateTitle()
}
