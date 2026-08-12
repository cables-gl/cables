const
    inO = op.inObject("Graph"),
    inSrc = op.inStringEditor("Base Code", "name"),
    outCode = op.outString("Code");

const sgp = new CGL.ShaderGraphProgram(op, inO, "frag");

inSrc.onChange =
    inO.onChange = () =>
    {

        sgp.compile();
        let str = inSrc.get();

        str = str.replaceAll("{{MAIN}}", sgp.srcMain);
        str = str.replaceAll("{{HEADER}}", sgp.srcHeader);

        outCode.set(str);

    };
