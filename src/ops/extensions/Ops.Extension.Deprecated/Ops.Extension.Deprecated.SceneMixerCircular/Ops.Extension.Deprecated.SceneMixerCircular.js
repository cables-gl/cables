// constatnts
let NUM_PORTS = 10;

// vars
// var numPortsActive = NUM_PORTS;
let numPortsActive = 0;

// inputs
let exePort = op.inTriggerButton("Execute");
let selectPort = op.inValue("Select");
// var numPortsActivePort = op.inValue('Num Active', NUM_PORTS);
let overlapPort = op.inValueSlider("Overlap", 0.5);

// outputs
// var triggerBeforePort = op.outTrigger('Trigger Before');
let triggerPorts = [];
createOutPorts();
// the percentage of the next trigger coming in, can be used for fading
// var percentPort = op.outValue('Percent', 0); // needs to be further tested
// var triggerAfterPort = op.outTrigger('Trigger After');

// listeners
exePort.onTriggered = setOutPorts;
// numPortsActivePort.onChange = onNumPortsActiveChange;

// functions

/**
 * Called when `numPortsActivePort` changes.
 * Makes sure it is always in range `[0..NUM_PORTS-1]``
 */
/*
function onNumPortsActiveChange() {
    numPortsActive = Math.round(numPortsActivePort.get());
    if(numPortsActive < 0) {
        numPortsActive = 0;
    } else if(numPortsActive > NUM_PORTS-1) {
        numPortsActive = NUM_PORTS-1;
    }
}
*/

function setOutPorts()
{
    // triggerBeforePort.trigger();
    if (numPortsActive > 0)
    {
        let overlap = CABLES.map(overlapPort.get(), 0, 1, 0.49999999, 0.99999999);
        let select = selectPort.get() % numPortsActive;
        let selectedIndex = checkIndex(Math.round(select));
        let frac = select % 1;
        // op.log('numPortsActive: ', numPortsActive);
        // op.log('select: ', select);
        // op.log('selectedIndex: ', selectedIndex);
        // op.log('---');
        if (Math.round(select) === numPortsActive)
        {
            select = -frac;
            var previousIndex = getPreviousIndex(selectedIndex);
            if (overlap > frac)
            {
                triggerPorts[previousIndex].trigger();
            }
            // percentPort.set(mapPercent(frac));
        }
        else if (select < selectedIndex)
        {
            var previousIndex = getPreviousIndex(selectedIndex);
            if (overlap > frac)
            {
                triggerPorts[previousIndex].trigger();
            }
            // percentPort.set(mapPercent(1 - (selectedIndex - select)));
        }
        else
        {
            let nextIndex = getNextIndex(selectedIndex);
            if (overlap > (1 - frac))
            {
                triggerPorts[nextIndex].trigger();
            }
            // percentPort.set(mapPercent(1 - (select - selectedIndex)));
        }
        triggerPorts[selectedIndex].trigger();
    }
    // triggerAfterPort.trigger();
}

function checkIndex(index)
{
    if (index < 0)
    {
        return numPortsActive - 1;
    }
    if (index > numPortsActive - 1)
    {
        return 0;
    }
    return index;
}

function getPreviousIndex(index)
{
    let previous = index - 1;
    return checkIndex(previous);
}

function getNextIndex(index)
{
    let next = index + 1;
    return checkIndex(next);
}

function createOutPorts()
{
    for (let i = 0; i < NUM_PORTS; i++)
    {
        let port = op.outTrigger("Trigger " + i);
        port.onLinkChanged = reCheckNumPortsActive;
        triggerPorts.push(port);
    }
}

function reCheckNumPortsActive()
{
    numPortsActive = findBiggestLinkedPortIndex() + 1;
}

function findBiggestLinkedPortIndex()
{
    for (let i = NUM_PORTS - 1; i >= 0; i--)
    {
        if (triggerPorts[i].isLinked())
        {
            return i;
        }
    }
    return -1;
}

/**
 * Maps from [0.5..1] to [0..1]
 */
function mapPercent(percent)
{
    return CABLES.map(percent, 0.5, 1, 0, 1);
}
