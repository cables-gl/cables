const
    visible = op.inValueBool("visible", true),
    inClear = op.inTriggerButton("Clear"),
    outEle = op.outObject("Element", null, "element");

let eleLog = null;
let canvas = op.patch.cgl.canvas.parentElement;

let oldLog = console.log;
let oldLogError = console.error;
let oldLogWarn = console.warn;

console.log = thelog;
console.error = thelog;
console.warn = thelog;

addElement();

op.onDelete = function ()
{
    removeElement();
    console.log = oldLog;
    console.error = oldLogError;
    console.warn = oldLogWarn;
};

visible.onChange = function ()
{
    if (visible.get()) eleLog.style.display = "block";
    else eleLog.style.display = "none";
};

function addElement()
{
    if (eleLog)removeElement();
    eleLog = document.createElement("div");
    eleLog.style.padding = "0px";
    eleLog.style.position = "absolute";
    eleLog.style.overflow = "scroll";
    if (CABLES.UI)
    {
        eleLog.style.width = "100%";
        eleLog.style.height = "50%";
    }
    else
    {
        eleLog.style.width = "100vw";
        eleLog.style.height = "50vh";
    }
    eleLog.style["background-color"] = "rgba(0,0,0,0.74)";
    eleLog.style["box-sizing"] = "border-box";
    eleLog.style.padding = "5px";
    eleLog.style["z-index"] = "9999";
    eleLog.style.color = "#fff";

    canvas.appendChild(eleLog);
}

function removeElement()
{
    canvas.removeChild(eleLog);
    eleLog = null;
}

function thelog()
{
    if (!eleLog)addElement();
    oldLog.apply(console, arguments);

    try
    {
        let html = "<code style=\"display:block;overflow:hidden;margin-top:3px;border-bottom:1px solid #000;padding:3px;\">";
        for (let i = 0; i < arguments.length; i++)
        {
            if (typeof arguments[i] == "object") html += (JSON && JSON.stringify ? JSON.stringify(arguments[i], undefined, 2) : arguments[i]) + " ";
            else html += arguments[i] + " ";
        }
        eleLog.innerHTML += html + "</code>";
    }
    catch (e) {}
    eleLog.scrollTop = eleLog.scrollHeight;
}

inClear.onTriggered = () =>
{
    eleLog.innerHTML = "";
};
