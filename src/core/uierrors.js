let simpleLogDiv = null;
const data = {};

export function showUiErrors(op, id, txt, level, options)
{

    data[op.id + id] = { "op": op, "txt": txt, "id": id, options };

    let html = "";
    let found = false;
    for (const i in data)
    {
        if (data[i] && data[i].txt)
        {
            html += data[i].op.name + ": " + data[i].txt + " " + (data[i].options?.info) || "" + "<br/>";
            found = true;
        } // console.log(patch.ops[i].uiAttribs);
    }

    if (simpleLogDiv && !found)
    {
        simpleLogDiv.remove();
        return;
    }
    if (!simpleLogDiv)
    {
        simpleLogDiv = document.createElement("div");
        simpleLogDiv.style.position = "absolute";
        simpleLogDiv.style.border = "1px solid red";
        simpleLogDiv.style.backgroundColor = "#222";
        simpleLogDiv.style.zIndex = "100000";
        simpleLogDiv.style.padding = "10px";
        simpleLogDiv.style.top = "0px";

        simpleLogDiv.classList.add("cablesErrorLog");
        document.body.appendChild(simpleLogDiv);

    }
    simpleLogDiv.innerHTML = html;

}
