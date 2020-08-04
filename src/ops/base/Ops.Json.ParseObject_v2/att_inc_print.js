let tab = null;

function closeTab()
{
    if (tab)gui.mainTabs.closeTab(tab.id);
}

function printNode(html, key, node, path, level)
{
    html += "<tr class=\"row\">";
    let i = 0;
    let ident = "";

    for (i = 0; i < level; i++)
    {
        // var last=level-1==i;
        // var identClass=last?"identnormal":"identlast";

        let identClass = "identBg";
        if (i == 0)identClass = "identBgLevel0";
        // if(i==level-1)identClass="identBgLast";
        ident += "<td class=\"ident  " + identClass + "\" ><div style=\"\"></div></td>";
    }
    html += ident;
    html += "<td colspan=\"" + (20 - level) + "\">";
    if (Array.isArray(node))
    {
        html += "<span class=\"icon icon-arrow-down-right\">[]</span> &nbsp;";
    }
    else if (typeof node === "object")
    {
        html += "<span class=\"icon icon-arrow-down-right\">[]</span> &nbsp;";
    }
    else
    {
        html += "<span class=\"icon icon-circle\">[]</span> &nbsp;";
    }
    html += key;
    html += "</td>";

    html += "<td>";
    if (!Array.isArray(node) && !(typeof node === "object"))
    {
        html += node;
    }
    html += "</td>";

    html += `<td>${path}</td>`;
    html += "<td>";
    if (level > 1)
    {
        const hideclass = "";
        // if (node.hidden)hideclass = "node-hidden";

        html += "Expose: <a onclick=\"gui.corePatch().getOpById('" + op.id + "').exposeArray('" + path + "')\" class=\"treebutton\">Array</a>";
        html += "&nbsp;";
        html += "<a onclick=\"gui.corePatch().getOpById('" + op.id + "').exposeNode('" + path + "')\" class=\"treebutton\">Value</a>";
    }
    html += "</td>";

    html += "</tr>";

    if (Array.isArray(node))
    {
        for (i = 0; i < node.length; i++)
        {
            const newPath = path + "." + i;
            html = printNode(html, i, node[i], newPath, level + 1);
        }
    }
    else if (typeof node === "object")
    {
        const children = Object.keys(node);
        for (i = 0; i < children.length; i++)
        {
            const newKey = children[i];
            const newPath = path + "." + newKey;
            html = printNode(html, newKey, node[newKey], newPath, level + 1);
        }
    }

    return html;
}

function printJsonInfo()
{
    if (!json) return;

    const sizes = {};

    let html = "<div style=\"overflow:scroll;width:100%;height:100%\">";

    let elements = [];
    if (Array.isArray(json))
    {
        elements = json;
    }
    else if (typeof json === "object")
    {
        elements = Object.keys(json);
    }

    html += "<h3>Nodes (" + elements.length + ")</h3>";
    html += "<table class=\"table treetable\">";

    html += "<tr>";
    html += " <th colspan=\"20\">Name</th>";
    html += " <th>Value</th>";
    html += " <th>Path</th>";
    html += " <th>Show</th>";
    html += "</tr>";

    for (let i = 0; i < elements.length; i++)
    {
        if (Array.isArray(json))
        {
            const path = i;
            html = printNode(html, i, json[i], path, 1);
        }
        else if (typeof json === "object")
        {
            const key = elements[i];
            const path = key;
            html = printNode(html, key, json[key], path, 1);
        }
    }
    html += "</table>";
    html += "</div>";

    // closeTab();
    tab = new CABLES.UI.Tab("JSON", { "icon": "cube", "infotext": "tab_json", "padding": true, "singleton": true });
    gui.mainTabs.addTab(tab, true);
    tab.html(html);
}

function readableSize(n)
{
    if (n > 1024) return Math.round(n / 1024) + " kb";
    if (n > 1024 * 500) return Math.round(n / 1024) + " mb";
    else return n + " bytes";
}
