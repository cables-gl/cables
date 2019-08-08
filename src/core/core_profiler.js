import { now } from "./timer";

const Profiler = function ()
{
    var items = {};
    var currentId = null;
    var currentStart = 0;

    this.getItems = function ()
    {
        return items;
    };

    this.clear = function ()
    {
        items = {};
    };

    this.add = function (type, object)
    {
        if (currentId !== null)
        {
            if (!object || object.id != currentId)
            {
                if (items[currentId])
                {
                // console.log(currentStart);
                    items[currentId].timeUsed += performance.now() - currentStart;

                    if (!items[currentId].peakTime || now() - items[currentId].peakTime > 5000)
                    {
                        if (items[currentId].peak > 1 && object)
                        {
                            console.log("PEAK ", object.parent.objName);
                        }

                        items[currentId].peak = 0;
                        items[currentId].peakTime = now();
                    }
                    items[currentId].peak = Math.max(items[currentId].peak, performance.now() - currentStart);
                }
            }
        }

        if (object !== null)
        {
            if (!items[object.id])
            {
                items[object.id] = {
                    numTriggers: 0,
                    timeUsed: 0,
                };
            }

            items[object.id].numTriggers++;
            items[object.id].title = `${object.parent.name} ${object.name}`;

            currentId = object.id;
            currentStart = performance.now();
        }
        else
        {
            currentId = null;
        }
    };

    this.print = function ()
    {
        console.log("--------");
        for (var i in items)
        {
            console.log(`${items[i].title}: ${items[i].numTriggers} / ${items[i].timeUsed}`);
        }
    };
};

export default Profiler;
