let simpleLogDiv = null;
const data = {};

export function showUiErrors(op, id, txt, level, options)
{

    data[op.id + id] = { "op": op, "txt": txt, "id": id, options };

    if (!simpleLogDiv)
    {
        console.log("errdisp");
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
    let html = "";
    for (const i in data)
    {
        if (data[i] && data[i].txt)
            html += data[i].op.name + ": " + data[i].txt + " " + (data[i].options?.info) || "" + "<br/>";
        // console.log(patch.ops[i].uiAttribs);
    }

    simpleLogDiv.innerHTML = html;

}
