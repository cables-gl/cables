const
    inO = op.inObject("Graph"),
    inSrc = op.inStringEditor("Base Code", "name", "glsl"),
    debug = op.inBool("Debug comments", false),
    types = op.inBool("Set Type Title", true),
    ids = op.inBool("Show id", true),
    outCode = op.outString("Code"),
    outUniforms = op.outArray("Uniforms");

const sgp = new CABLES.ShaderGraphProgram(inO, new CABLES.LangWgsl());

ids.onChange =
    types.onChange =
    debug.onChange =
    inSrc.onChange =
    inO.onChange = () =>
    {
        sgp.compile({ "showType": types.get(), "debug": debug.get(), "showId": ids.get });
        let str = inSrc.get() || "";

        /* minimalcore:start */

        op.setUiError("nomain", str.includes("{{MAIN}}") ? null : "no {{MAIN}} found!");
        op.setUiError("noHEADER", str.includes("{{HEADER}}") ? null : "no {{HEADER}} found!");

        /* minimalcore:end */

        str = str.replaceAll("{{MAIN}}", sgp.srcMain);
        str = str.replaceAll("{{HEADER}}", sgp.srcHeader);

        outUniforms.setRef(Object.values(sgp.updateableOps));

        outCode.set(str);
    };
