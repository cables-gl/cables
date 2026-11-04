const port_6d97cewid = op.inFloat("6d97cewid", 0);
port_6d97cewid.setUiAttribs({ "title": "result" });

const port_ymb057f5n = op.inFloat("ymb057f5n", 0);
port_ymb057f5n.setUiAttribs({ "title": "Number Input" });
port_ymb057f5n.setUiAttribs({ "values": [""] });

const port_0ng9bkpxi = op.outNumber("0ng9bkpxi");
port_0ng9bkpxi.setUiAttribs({ "title": "value" });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_6d97cewid = addedOps[i].outNumber("innerOut_6d97cewid");
            innerOut_6d97cewid.set(port_6d97cewid.get());
            innerOut_6d97cewid.setUiAttribs({ "title": "result" });
            port_6d97cewid.on("change", (a, v) => { innerOut_6d97cewid.set(a); });

            const innerOut_ymb057f5n = addedOps[i].outNumber("innerOut_ymb057f5n");
            innerOut_ymb057f5n.set(port_ymb057f5n.get());
            innerOut_ymb057f5n.setUiAttribs({ "title": "Number Input" });
            port_ymb057f5n.on("change", (a, v) => { innerOut_ymb057f5n.set(a); });

        }
        if (addedOps[i].innerOutput)
        {
            const innerIn_0ng9bkpxi = addedOps[i].inFloat("innerIn_0ng9bkpxi");
            innerIn_0ng9bkpxi.setUiAttribs({ "title": "value" });
            innerIn_0ng9bkpxi.on("change", (a, v) => { port_0ng9bkpxi.set(a); });

        }
    }
};
