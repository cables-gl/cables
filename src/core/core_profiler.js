import { now } from "./timer";
import { Log } from "./log";

const Profiler = function ()
{
    let items = {};
    let currentId = null;
    let currentStart = 0;


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
                    // Log.log(currentStart);
                    items[currentId].timeUsed += performance.now() - currentStart;

                    if (!items[currentId].peakTime || now() - items[currentId].peakTime > 5000)
                    {
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
                    "numTriggers": 0,
                    "timeUsed": 0,
                };
            }

            items[object.id].numTriggers++;
            items[object.id].opid = object.parent.id;
            items[object.id].title = object.parent.name + "." + object.name;
            items[object.id].subPatch = object.parent.uiAttribs.subPatch;

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
        Log.log("--------");
        for (const i in items)
        {
            Log.log(items[i].title + ": " + items[i].numTriggers + " / " + items[i].timeUsed);
        }
    };
};

export { Profiler };
