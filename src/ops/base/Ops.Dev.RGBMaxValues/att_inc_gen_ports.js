const port_c7eli7o9i = op.inTrigger("c7eli7o9i");
port_c7eli7o9i.setUiAttribs({ "title": "render", });

const port_s0ibc22vb = op.inObject("s0ibc22vb");
port_s0ibc22vb.setUiAttribs({ "title": "Position Texture", "display": "texture", "objType": "texture", "objType": "texture" });

const port_iuqdv5507 = op.outObject("iuqdv5507");
port_iuqdv5507.setUiAttribs({ "title": "texture", "display": "texture", "objType": "texture", "objType": "texture" });

const port_ecq8sxutk = op.outTrigger("ecq8sxutk");
port_ecq8sxutk.setUiAttribs({ "title": "render", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_c7eli7o9i = addedOps[i].outTrigger("innerOut_c7eli7o9i");
            innerOut_c7eli7o9i.setUiAttribs({ "title": "render" });
            port_c7eli7o9i.onTriggered = () => { innerOut_c7eli7o9i.trigger(); };

            const innerOut_s0ibc22vb = addedOps[i].outTexture("innerOut_s0ibc22vb");
            innerOut_s0ibc22vb.setUiAttribs({ "title": "Position Texture" });
            port_s0ibc22vb.on("change", (a, v) => { innerOut_s0ibc22vb.setRef(a); });
        }
        if (addedOps[i].innerOutput)
        {
            const innerIn_iuqdv5507 = addedOps[i].inObject("innerIn_iuqdv5507");
            innerIn_iuqdv5507.setUiAttribs({ "title": "texture" });
            innerIn_iuqdv5507.on("change", (a, v) => { port_iuqdv5507.setRef(a); });

            const innerIn_ecq8sxutk = addedOps[i].inTrigger("innerIn_ecq8sxutk");
            innerIn_ecq8sxutk.setUiAttribs({ "title": "render" });
            innerIn_ecq8sxutk.onTriggered = () => { port_ecq8sxutk.trigger(); };
        }
    }
};
