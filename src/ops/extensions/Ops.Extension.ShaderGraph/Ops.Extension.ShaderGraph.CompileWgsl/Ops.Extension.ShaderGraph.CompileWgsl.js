const
    inO = op.inObject("Graph"),
    inSrc = op.inStringEditor("Base Code", "name"),
    outCode = op.outString("Code");

const sgp = new CABLES.ShaderGraphProgram(op, inO, "frag", new CABLES.LangWgsl());

inSrc.onChange =
    inO.onChange = () =>
    {

        sgp.compile();
        let str = inSrc.get();

        str = str.replaceAll("{{MAIN}}", sgp.srcMain);
        str = str.replaceAll("{{HEADER}}", sgp.srcHeader);

        outCode.set(str);

    };
