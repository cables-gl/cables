let UPDATE_RATE_DEFAULT = 500;
let UPDATE_RATE_MIN = 50;
let updateRate = UPDATE_RATE_DEFAULT;

const
    outYear = op.outNumber("Year"),
    outMonth = op.outNumber("Month"),
    outDay = op.outNumber("Day"),
    outHours = op.outNumber("Hours"),
    outMinutes = op.outNumber("Minutes"),
    outSeconds = op.outNumber("Seconds"),
    outTimestemp = op.outNumber("Timestamp"),
    updateRatePort = op.inInt("Update Rate", UPDATE_RATE_DEFAULT);

let d = new Date();

let timeout = setTimeout(update, UPDATE_RATE_DEFAULT);
update();

function update()
{
    d = new Date();

    outSeconds.set(d.getSeconds());
    outMinutes.set(d.getMinutes());
    outHours.set(d.getHours());
    outDay.set(d.getDate());
    outMonth.set(d.getMonth());
    outYear.set(d.getFullYear());

    timeout = setTimeout(update, updateRate);

    outTimestemp.set(Date.now());
}

updateRatePort.onChange = function ()
{
    let newUpdateRate = updateRatePort.get();
    if (newUpdateRate && newUpdateRate >= UPDATE_RATE_MIN)
    {
        updateRate = newUpdateRate;
    }
};

op.onDelete = function ()
{
    clearTimeout(timeout);
};
