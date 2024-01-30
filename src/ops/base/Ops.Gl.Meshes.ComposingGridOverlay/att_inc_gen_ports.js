const port_d19uw4ogh = op.inTrigger("d19uw4ogh");
port_d19uw4ogh.setUiAttribs({ "title": "Render", });

const port_m8bjeyajy = op.inFloat("m8bjeyajy", 1);
port_m8bjeyajy.setUiAttribs({ "title": "Scale", "display": "range", });

const port_3yfne154r = op.inFloat("3yfne154r", 1);
port_3yfne154r.setUiAttribs({ "title": "Show Center", "display": "bool", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_d19uw4ogh = addedOps[i].outTrigger("innerOut_d19uw4ogh");
            innerOut_d19uw4ogh.setUiAttribs({ "title": "Render" });
            port_d19uw4ogh.onTriggered = () => { innerOut_d19uw4ogh.trigger(); };

            const innerOut_m8bjeyajy = addedOps[i].outNumber("innerOut_m8bjeyajy");
            innerOut_m8bjeyajy.set(port_m8bjeyajy.get());
            innerOut_m8bjeyajy.setUiAttribs({ "title": "Scale" });
            port_m8bjeyajy.on("change", (a, v) => { innerOut_m8bjeyajy.set(a); });

            const innerOut_3yfne154r = addedOps[i].outNumber("innerOut_3yfne154r");
            innerOut_3yfne154r.set(port_3yfne154r.get());
            innerOut_3yfne154r.setUiAttribs({ "title": "Show Center" });
            port_3yfne154r.on("change", (a, v) => { innerOut_3yfne154r.set(a); });
        }
        if (addedOps[i].innerOutput)
        {
        }
    }
};
