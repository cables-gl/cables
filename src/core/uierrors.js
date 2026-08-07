let simpleLogDiv = null;
const data = {};
let lastHtml = "";

/**
 * @param {Op} op
 * @param {string} id
 * @param {string} txt
 * @param {number} level
 * @param {{}} options
 */
export function showUiErrors(op, id, txt, level, options)
{

    console.log(txt);

    /* minimalcore:start */
    data[op.id + id] = { "op": op, "txt": txt, "id": id, "options": options };

    let html = "";
    let found = false;
    for (const i in data)
    {
        if (data[i] && data[i].txt)
        {
            html += data[i].op.name + ": " + data[i].txt + " " + (data[i].options?.info || "") + "<br/>";
            found = true;
        }
    }

    if (simpleLogDiv && !found)
    {
        simpleLogDiv.remove();
        simpleLogDiv = null;
        return;
    }

    if (!found) return;
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
    if (lastHtml != html)
    {
        simpleLogDiv.innerHTML = html;
        lastHtml = html;
    }

    /* minimalcore:end */
}
