new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "unknown",
        "params": [],
        "results": [{ "type": "float", "name": "result" }]
    });

const
    code = op.inStringEditor("head src", "", "glsl");

op.init =
    code.onChange =
    () =>
    {
        const def = parseDef(code.get());
        op.shaderNode.name = def.name;
        op.shaderNode.src = code.get();
        op.shaderNode.params = def.params;
        op.shaderNode.resultVarName = def.name + op.shaderNode.id;

        op.shaderNode.results[0].type = def.returns;

        op.updateGraph();
    };

function parseDef(str)
{
    const lines = str.split("\n");

    let def = { "name": "unknown", "params": [], "returns": "float" };
    for (let i = 0; i < lines.length; i++)
    {
        if (lines[i].includes("@name")) def.name = lines[i].substr(lines[i].indexOf("@name") + "@name".length + 1).trim();
        if (lines[i].includes("@returns")) def.returns = lines[i].substr(lines[i].indexOf("@returns") + "@returns".length + 1).replaceAll("{", "").replaceAll("}", "").trim();
        if (lines[i].includes("@param"))
        {
            const p = {};
            const st = lines[i].substr(lines[i].indexOf("@param") + "@param".length + 1).replaceAll("{", "").replaceAll("}", "").trim();
            const parts = st.split(" ");
            def.params.push({ "type": parts[0], "name": parts[1], "port": op.getPortByName(parts[1]) });
        }
    }

    // console.log("def", def);
    return def;
}
