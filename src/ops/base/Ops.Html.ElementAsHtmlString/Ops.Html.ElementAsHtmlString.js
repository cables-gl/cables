const
    parentPort = op.inObject("Parent", null, "element"),
    inMeth = op.inSwitch("Method", ["outerHtml", "XML Serializer"], "outerHtml"),
    outStr = op.outString("HTML String");

inMeth.onChange =
    parentPort.onChange = () =>
    {
        if (parentPort.get())
        {

            if (inMeth.get() == "outerHtml")
                outStr.set(parentPort.get().outerHTML);
            else
            {

                const s = new XMLSerializer();
                const str = s.serializeToString(parentPort.get());

                outStr.set(str);

            }
        }
        else outStr.set("");
    };
