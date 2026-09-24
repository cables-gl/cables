const node = {
    "type": "function",
    "name": "sdfRaymarch",
    "params": [],
    "results": [{ "type": "vec4", "name": "result" }],
    "src": attachments.struct_glsl
};

new CABLES.ShaderGraphOp(op, node);

const
    inUv = op.inObject("uv", null, "sg"),
    inSdf = op.inObject("sdf", null, "sg");

const id = node.id;
node.name = "sdfRaymarch_" + id;

op.init = update;
inSdf.on("change", update);
inSdf.on(CABLES.Port.EVENT_LINK_CHANGED, update);
update();

function update()
{
    const child = inSdf.isLinked() ? inSdf.get() : null;
    const isSdf = !!(child && child.sdfMap);
    const type = isSdf ? "SdfShape" : "float";

    node.params = [
        { "type": "vec2", "name": "uv", "port": inUv },
        { "type": type, "name": "sdf", "port": inSdf }
    ];

    let map = "SdfHit(SDF_LARGE_NUMBER, vec4(0.))";
    if (isSdf) map = child.sdfMap + "(s, (s.invM * vec4(p, 1.)).xyz)";

    let src = attachments.raymarch_glsl;
    src = src.replaceAll("{{ID}}", id);
    src = src.replaceAll("{{TYPE}}", type);
    src = src.replaceAll("{{MAP}}", map);

    if (isSdf && child.sdfDecl) src = child.sdfDecl + src;

    node.srcUni = src;
    node.updateGraph();
}
