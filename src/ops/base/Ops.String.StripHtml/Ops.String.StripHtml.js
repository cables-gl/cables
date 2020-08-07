const
    inStr = op.inString("String", ""),
    outStr = op.outString("Result");

inStr.onChange = function ()
{
    // outStr.set((inStr.get() || "").replace(/(<([^>]+)>)/ig, ""));

    const parser = new DOMParser();
    const dom = parser.parseFromString(inStr.get(), "text/html");

    outStr.set(dom.body.textContent);
};
