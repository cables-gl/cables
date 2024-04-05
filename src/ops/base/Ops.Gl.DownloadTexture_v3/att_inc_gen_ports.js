const port_7zxlhqqf8 = op.inObject("7zxlhqqf8");
port_7zxlhqqf8.setUiAttribs({ "title": "Texture", "display": "texture", "objType": "texture", "objType": "texture" });
port_7zxlhqqf8.setUiAttribs({ "values": [""] });

const port_c6sm5ztz4 = op.inString("c6sm5ztz4", "PNG");
port_c6sm5ztz4.setUiAttribs({ "title": "Format", "display": "dropdown", });
port_c6sm5ztz4.setUiAttribs({ "values": ["PNG", "JPG", "WEBP"] });

const port_6ozewyh0e = op.inFloat("6ozewyh0e", 0.9);
port_6ozewyh0e.setUiAttribs({ "title": "Quality", "display": "range", });
port_6ozewyh0e.setUiAttribs({ "values": [""] });

const port_ainvr3s9o = op.inString("ainvr3s9o", "screenshot");
port_ainvr3s9o.setUiAttribs({ "title": "Filename", });
port_ainvr3s9o.setUiAttribs({ "values": [""] });

const port_uxwx45pbg = op.inTrigger("uxwx45pbg");
port_uxwx45pbg.setUiAttribs({ "title": "Download", "display": "button", });
port_uxwx45pbg.setUiAttribs({ "values": [""] });

const port_jcrmz8mnz = op.outTrigger("jcrmz8mnz");
port_jcrmz8mnz.setUiAttribs({ "title": "Next", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_7zxlhqqf8 = addedOps[i].outTexture("innerOut_7zxlhqqf8");
            innerOut_7zxlhqqf8.setUiAttribs({ "title": "Texture" });
            port_7zxlhqqf8.on("change", (a, v) => { innerOut_7zxlhqqf8.setRef(a); });

            const innerOut_c6sm5ztz4 = addedOps[i].outString("innerOut_c6sm5ztz4");
            innerOut_c6sm5ztz4.set(port_c6sm5ztz4.get());
            innerOut_c6sm5ztz4.setUiAttribs({ "title": "Format" });
            port_c6sm5ztz4.on("change", (a, v) => { innerOut_c6sm5ztz4.set(a); });

            const innerOut_6ozewyh0e = addedOps[i].outNumber("innerOut_6ozewyh0e");
            innerOut_6ozewyh0e.set(port_6ozewyh0e.get());
            innerOut_6ozewyh0e.setUiAttribs({ "title": "Quality" });
            port_6ozewyh0e.on("change", (a, v) => { innerOut_6ozewyh0e.set(a); });

            const innerOut_ainvr3s9o = addedOps[i].outString("innerOut_ainvr3s9o");
            innerOut_ainvr3s9o.set(port_ainvr3s9o.get());
            innerOut_ainvr3s9o.setUiAttribs({ "title": "Filename" });
            port_ainvr3s9o.on("change", (a, v) => { innerOut_ainvr3s9o.set(a); });

            const innerOut_uxwx45pbg = addedOps[i].outTrigger("innerOut_uxwx45pbg");
            innerOut_uxwx45pbg.setUiAttribs({ "title": "Download" });
            port_uxwx45pbg.onTriggered = () => { innerOut_uxwx45pbg.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
            const innerIn_jcrmz8mnz = addedOps[i].inTrigger("innerIn_jcrmz8mnz");
            innerIn_jcrmz8mnz.setUiAttribs({ "title": "Next" });
            innerIn_jcrmz8mnz.onTriggered = () => { port_jcrmz8mnz.trigger(); };
        }
    }
};
