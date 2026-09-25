const node = {
    "type": "function",
    "name": "sdfGroup",
    "params": [],
    "results": [{ "type": "SdfShape", "name": "sdf" }]
};

new CABLES.ShaderGraphOp(op, node);

const modeFunctions = {
    "Union": "sdfSmoothUnion",
    "Subtract": "sdfSmoothSubtract",
    "Intersect": "sdfSmoothIntersect"
};

const
    inMode = op.inSwitch("Mode", Object.keys(modeFunctions), "Union"),
    inShapes = op.inMultiPort2("Shapes", CABLES.Port.TYPE_OBJECT),
    inBlend = op.inObject("blend", null, "sg"),
    inTransform = op.inObject("transform", null, "sg");

const id = node.id;
node.name = "sdfGroup_" + id;
node.results[0].data = {
    "sdfMap": "sdfGroupMap_" + id,
    "sdfDecl": "SdfHit sdfGroupMap_" + id + "(SdfShape s, vec3 p);\n"
};

op.init = update;
inMode.onChange = update;
inShapes.on("change", update);
inShapes.on(CABLES.Port.EVENT_LINK_CHANGED, update);
update();

function update()
{
    const combine = modeFunctions[inMode.get()] || modeFunctions.Union;
    const blend = "sdf_" + id + "_blend";

    // params have to match all object input ports, the shader graph counts them for the commas
    const params = [];
    const args = [];
    let decl = "";
    let store = "";
    let map = "";

    for (let i = 0; i < inShapes.ports.length; i++)
    {
        const p = inShapes.ports[i];
        const child = p.isLinked() ? p.get() : null;
        const isSdf = !!(child && child.sdfMap);
        const type = isSdf ? "SdfShape" : "float";
        params.push({ "type": type, "name": p.name, "port": p });
        args.push(type + " s" + i);
        if (!isSdf) continue;

        const c = "sdf_" + id + "_c" + i;
        const hit = child.sdfMap + "(" + c + ", (" + c + ".invM * vec4(p, 1.)).xyz)";
        decl += (child.sdfDecl || "") + "SdfShape " + c + ";\n";
        store += "    " + c + " = s" + i + ";\n";

        // the first shape is the base, subtract and intersect depend on the order
        if (!map) map += "    SdfHit res = " + hit + ";\n";
        else map += "    res = " + combine + "(res, " + hit + ", " + blend + ");\n";
    }

    if (!map) map = "    SdfHit res = SdfHit(SDF_LARGE_NUMBER, vec4(0.));\n";

    params.push({ "type": "float", "name": "blend", "port": inBlend, "value": 0 });
    params.push({ "type": "mat4", "name": "transform", "port": inTransform });
    args.push("float blend", "mat4 m");
    node.params = params;

    node.srcUni = decl
        + "float " + blend + ";\n"
        + "SdfShape sdfGroup_" + id + "(" + args.join(", ") + ")\n{\n"
        + store
        + "    " + blend + " = blend;\n"
        + "    return SdfShape(vec4(0.), vec4(0.), sdfInverse(m), vec4(0.), 1.);\n}\n"
        + "SdfHit sdfGroupMap_" + id + "(SdfShape s, vec3 p)\n{\n"
        + map
        + "    return res;\n}\n";

    node.updateGraph();
}
