const
    inStr = op.inString("String"),
    inSearch = op.inString("Search For", "foo"),
    inRepl = op.inString("Replace", "bar"),
    inWhat = op.inSwitch("Replace What", ["All", "First"], "All"),
    outStr = op.outString("Result");

inRepl.onChange =
inStr.onChange =
inWhat.onChange =
inSearch.onChange = update;

function update()
{
    let str = "";

    // if(inWhat.get()=="All") str=String(inStr.get()).replaceAll(inSearch.get(),inRepl.get());

    if (inWhat.get() == "All") str = str.replace(new RegExp(inSearch.get(), "g"), inRepl.get());
    else str = String(inStr.get()).replace(inSearch.get(), inRepl.get());

    outStr.set(str);
}
