const port_nqa9m1uyx = op.inArray("nqa9m1uyx");
port_nqa9m1uyx.setUiAttribs({ "title": "Value", });

const port_v956ql4r2 = op.inObject("v956ql4r2");
port_v956ql4r2.setUiAttribs({ "title": "texture", "display": "texture", "objType": "texture", "objType": "texture" });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_nqa9m1uyx = addedOps[i].outArray("innerOut_nqa9m1uyx");
            innerOut_nqa9m1uyx.setUiAttribs({ "title": "Value" });
            port_nqa9m1uyx.on("change", (a, v) => { innerOut_nqa9m1uyx.setRef(a); });

            const innerOut_v956ql4r2 = addedOps[i].outTexture("innerOut_v956ql4r2");
            innerOut_v956ql4r2.setUiAttribs({ "title": "texture" });
            port_v956ql4r2.on("change", (a, v) => { innerOut_v956ql4r2.setRef(a); });
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
