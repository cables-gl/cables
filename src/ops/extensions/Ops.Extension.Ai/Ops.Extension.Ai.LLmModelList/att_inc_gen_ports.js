const port_z2gtag4y7 = op.outArray("z2gtag4y7");
port_z2gtag4y7.setUiAttribs({ "title": "result", });

const port_30ya1e4g1 = op.inString("30ya1e4g1", "https://openrouter.ai/api");
port_30ya1e4g1.setUiAttribs({ "title": "string1", });

const port_ksiv4yqm7 = op.inObject("ksiv4yqm7");
port_ksiv4yqm7.setUiAttribs({ "title": "headers", });

const port_my3mcj546 = op.inTrigger("my3mcj546");
port_my3mcj546.setUiAttribs({ "title": "Reload", "display": "button", });

const port_42rvai2nv = op.outNumber("42rvai2nv");
port_42rvai2nv.setUiAttribs({ "title": "Is Loading", "display": "boolnum", });

const port_jcju8npa2 = op.outNumber("jcju8npa2");
port_jcju8npa2.setUiAttribs({ "title": "Has Error", "display": "boolnum", });

const port_ozg9pnd1z = op.outString("ozg9pnd1z");
port_ozg9pnd1z.setUiAttribs({ "title": "Error", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_30ya1e4g1 = addedOps[i].outString("innerOut_30ya1e4g1");
            innerOut_30ya1e4g1.set(port_30ya1e4g1.get());
            innerOut_30ya1e4g1.setUiAttribs({ "title": "string1" });
            port_30ya1e4g1.on("change", (a, v) => { innerOut_30ya1e4g1.set(a); });

            const innerOut_ksiv4yqm7 = addedOps[i].outObject("innerOut_ksiv4yqm7");
            innerOut_ksiv4yqm7.setUiAttribs({ "title": "headers" });
            port_ksiv4yqm7.on("change", (a, v) => { innerOut_ksiv4yqm7.setRef(a); });

            const innerOut_my3mcj546 = addedOps[i].outTrigger("innerOut_my3mcj546");
            innerOut_my3mcj546.setUiAttribs({ "title": "Reload" });
            port_my3mcj546.onTriggered = () => { innerOut_my3mcj546.trigger(); };
        }
        if (addedOps[i].innerOutput)
        {
            const innerIn_z2gtag4y7 = addedOps[i].inArray("innerIn_z2gtag4y7");
            innerIn_z2gtag4y7.setUiAttribs({ "title": "result" });
            innerIn_z2gtag4y7.on("change", (a, v) => { port_z2gtag4y7.setRef(a); });

            const innerIn_42rvai2nv = addedOps[i].inFloat("innerIn_42rvai2nv");
            innerIn_42rvai2nv.setUiAttribs({ "title": "Is Loading" });
            innerIn_42rvai2nv.on("change", (a, v) => { port_42rvai2nv.set(a); });

            const innerIn_jcju8npa2 = addedOps[i].inFloat("innerIn_jcju8npa2");
            innerIn_jcju8npa2.setUiAttribs({ "title": "Has Error" });
            innerIn_jcju8npa2.on("change", (a, v) => { port_jcju8npa2.set(a); });

            const innerIn_ozg9pnd1z = addedOps[i].inString("innerIn_ozg9pnd1z");
            innerIn_ozg9pnd1z.setUiAttribs({ "title": "Error" });
            innerIn_ozg9pnd1z.on("change", (a, v) => { port_ozg9pnd1z.set(a); });
        }
    }
};
