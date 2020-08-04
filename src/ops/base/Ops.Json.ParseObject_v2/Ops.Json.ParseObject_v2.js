const
    str = op.inStringEditor("JSON String", "{}", "json"),
    outObj = op.outObject("Result"),
    isValid = op.outValue("Valid"),
    inShow = op.inTriggerButton("Show Structure");

str.onChange = parse;
parse();

let json = null;

inShow.onTriggered = printJsonInfo;
inShow.hidePort();

function parse()
{
    try
    {
        const obj = JSON.parse(str.get());
        outObj.set(null);
        outObj.set(obj);
        isValid.set(true);
        json = obj;
        op.setUiError("invalidjson", null);
    }
    catch (ex)
    {
        console.log(JSON.stringify(ex));
        isValid.set(false);

        let outStr = "";
        const parts = ex.message.split(" ");
        for (let i = 0; i < parts.length - 1; i++)
        {
            const num = parseFloat(parts[i + 1]);
            if (num && parts[i] == "position")
            {
                const outStrA = str.get().substring(num - 15, num);
                const outStrB = str.get().substring(num, num + 1);
                const outStrC = str.get().substring(num + 1, num + 15);
                outStr = "<span style=\"font-family:monospace;background-color:black;\">" + outStrA + "<span style=\"font-weight:bold;background-color:red;\">" + outStrB + "</span>" + outStrC + " </span>";
            }
        }

        op.setUiError("invalidjson", "INVALID JSON<br/>can not parse string to object:<br/><b> " + ex.message + "</b><br/>" + outStr);
    }
}


op.exposeNode = function (path)
{
    const newop = gui.corePatch().addOp("Ops.Json.ObjectGetByPath");
    newop.getPort("Path").set(path);
    op.patch.link(op, outObj.name, newop, "Object");
    gui.patch().focusOp(newop.id, true);
    CABLES.UI.MODAL.hide();
};

op.exposeArray = function (path)
{
    const newop = gui.corePatch().addOp("Ops.Json.ObjectGetArrayByPath");
    newop.getPort("Path").set(path);
    op.patch.link(op, outObj.name, newop, "Object");
    gui.patch().focusOp(newop.id, true);
    CABLES.UI.MODAL.hide();
};
