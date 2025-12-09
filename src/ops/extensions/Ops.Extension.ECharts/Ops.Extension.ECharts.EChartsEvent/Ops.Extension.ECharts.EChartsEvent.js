const inChart = op.inObject("ECharts instance");
const evtName = op.inString("Event name");
const queryStr = op.inString("Query string");
const queryObj = op.inObject("Query object");
const inExecute = op.inTriggerButton("Refresh event binding");

const outChart = op.outObject("Out Chart");
const outTrigger = op.outTrigger("Trigger");
const outEvent = op.outObject("Event params");
const outDirty = op.outBool("Dirty (needs rebind)");

op.onDelete = removeEvent;
inExecute.onTriggered = main;
evtName.onChange = queryStr.onChange = queryObj.onChange = setIsDirty;
inChart.onChange = chartChanged;

let chart = null;
let eventName = null;

function chartChanged()
{
    if (!inChart.isLinked())
    {
        removeEvent();
        setIsDirty();
        return;
    }
    addEvent();
}

function setIsDirty()
{
    setDirty(true);
}

function setDirty(v)
{
    outDirty.set(null);
    outDirty.set(v);
}

function removeEvent()
{
    if (chart && eventName)
    {
        chart.off(eventName);
        chart = null;
    }
}

function addEvent()
{
    const newChart = inChart.get();
    if (!newChart)
    {
        removeEvent();
        setDirty(true);
        outChart.set(null);
        return;
    }

    if (newChart == chart)
    {
        // same reference
        // do nothing, event is already bound
        return;
    }

    chart = newChart;

    try
    {
        eventName = evtName.get();
        let q = queryObj.get();
        if (!q)
        {
            // if we don't use the query obj
            q = queryStr.get();
        }

        //  bind actual event
        chart.on(eventName, q, (e) =>
        {
            // Delete to remove circular parsing in Cables
            delete e.$vars;
            delete e.event.event;
            delete e.event.target;
            delete e.event.topTarget;

            outEvent.set(e);

            outTrigger.trigger();
        });

        // remove error message if any
        op.setUiError("error", null);
        setDirty(false);
        outChart.set(chart);
    }
    catch (error)
    {
        setDirty(true);
        chart = null;
        const errorMsg = error + " - check if input is ECharts instance";
        op.setUiError("error", errorMsg);
        outChart.set(null);
    }
}

function main()
{
    removeEvent();
    addEvent();
}
