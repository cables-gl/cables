const
    paramName = op.inString("parameter"),
    def = op.inString("Default"),
    result = op.outString("result");

def.onChange = update;
paramName.onChange = updateParam;

const query = {};
const a = window.location.search.substr(1).split("&");

update();

for (let i = 0; i < a.length; i++)
{
    const b = a[i].split("=");
    query[decodeURIComponent(b[0])] = decodeURIComponent(b[1] || "");
}

function updateParam()
{
    op.setUiAttrib({ "extendTitle": paramName.get() });
    update();
}

function update()
{
    if (!query.hasOwnProperty(paramName.get()))
    {
        result.set(def.get() || null);
    }
    else
    {
        let v = query[paramName.get()];
        if (v === "true")v = true;
        else if (v === "false")v = false;

        result.set(v);
    }
}
