op.name="DateAndTime";

var UPDATE_RATE_DEFAULT = 500;
var UPDATE_RATE_MIN = 50;
var updateRate = UPDATE_RATE_DEFAULT;

var outYear=op.outValue("Year");
var outMonth=op.outValue("Month");
var outDay=op.outValue("Day");
var outHours=op.outValue("Hours");
var outMinutes=op.outValue("Minutes");
var outSeconds=op.outValue("Seconds");
var outTimestemp=op.outValue("Timestamp");
var d = new Date();
var updateRatePort = op.inValue("Update Rate", UPDATE_RATE_DEFAULT);

var timeout=setTimeout(update, UPDATE_RATE_DEFAULT);
update();

function update()
{
    d = new Date();

    outSeconds.set( d.getSeconds() );
    outMinutes.set( d.getMinutes() );
    outHours.set( d.getHours() );
    outDay.set( d.getDate() );
    outMonth.set( d.getMonth() );
    outYear.set( d.getFullYear() );
    
    timeout=setTimeout(update, updateRate);
    
    outTimestemp.set(Date.now());
}

updateRatePort.onChange = function() {
    var newUpdateRate = updateRatePort.get();
    if(newUpdateRate && newUpdateRate >= UPDATE_RATE_MIN) {
        updateRate = newUpdateRate;
    }
};

op.onDelete=function()
{
    clearTimeout(timeout);
};