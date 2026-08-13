const
    inO = op.inObject("Graph"),
    inSrc = op.inStringEditor("Base Code", "name"),
    debug = op.inBool("Debug comments", false),
    types = op.inBool("Set Type Title", true),
    ids = op.inBool("Show id", true),
    outCode = op.outString("Code");

const sgp = new CABLES.ShaderGraphProgram(op, inO, "frag", new CABLES.LangWgsl());

ids.onChange =
    types.onChange =
    debug.onChange =
    inSrc.onChange =
    inO.onChange = () =>
    {
        sgp.compile({ "showType": types.get(), "debug": debug.get(), "showId": ids.get });
        let str = inSrc.get();

        str = str.replaceAll("{{MAIN}}", sgp.srcMain);
        str = str.replaceAll("{{HEADER}}", sgp.srcHeader);

        outCode.set(str);
    };
