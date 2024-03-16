const port_ip34w2ny0 = op.inFloat("ip34w2ny0", 0);
port_ip34w2ny0.setUiAttribs({ "title": "Index", "increment": "integer", });

const port_wiikdxo89 = op.inTrigger("wiikdxo89");
port_wiikdxo89.setUiAttribs({ "title": "exe", });

const port_s0ddunhhz = op.inFloat("s0ddunhhz", 1);
port_s0ddunhhz.setUiAttribs({ "title": "Duration", });

const port_4gu5lv66h = op.outNumber("4gu5lv66h");
port_4gu5lv66h.setUiAttribs({ "title": "Out Value", });

const port_qutsn94pc = op.outTrigger("qutsn94pc");
port_qutsn94pc.setUiAttribs({ "title": "Trigger 0", });

const port_8xpkgorjm = op.outTrigger("8xpkgorjm");
port_8xpkgorjm.setUiAttribs({ "title": "Trigger 1", });

const port_hvyzlh9o8 = op.outTrigger("hvyzlh9o8");
port_hvyzlh9o8.setUiAttribs({ "title": "Trigger 2", });

const port_367wv95xd = op.outTrigger("367wv95xd");
port_367wv95xd.setUiAttribs({ "title": "Trigger 3", });

const port_7ju3j2fy0 = op.outTrigger("7ju3j2fy0");
port_7ju3j2fy0.setUiAttribs({ "title": "Trigger 4", });

const port_t8dvyjuoq = op.outTrigger("t8dvyjuoq");
port_t8dvyjuoq.setUiAttribs({ "title": "Trigger 5", });

const port_72naih78e = op.outTrigger("72naih78e");
port_72naih78e.setUiAttribs({ "title": "Trigger 6", });

const port_0s04tm21u = op.outTrigger("0s04tm21u");
port_0s04tm21u.setUiAttribs({ "title": "Trigger 7", });

const port_93jpxulns = op.outTrigger("93jpxulns");
port_93jpxulns.setUiAttribs({ "title": "Trigger 8", });

const port_a0w7orgi8 = op.outTrigger("a0w7orgi8");
port_a0w7orgi8.setUiAttribs({ "title": "Trigger 9", });

const port_r8h4qx4z8 = op.outTrigger("r8h4qx4z8");
port_r8h4qx4z8.setUiAttribs({ "title": "Trigger 10", });

const port_cr80a86xi = op.outTrigger("cr80a86xi");
port_cr80a86xi.setUiAttribs({ "title": "Trigger 11", });

op.initInnerPorts = function (addedOps)
{
    for (let i = 0; i < addedOps.length; i++)
    {
        if (addedOps[i].innerInput)
        {
            const innerOut_ip34w2ny0 = addedOps[i].outNumber("innerOut_ip34w2ny0");
            innerOut_ip34w2ny0.set(port_ip34w2ny0.get());
            innerOut_ip34w2ny0.setUiAttribs({ "title": "Index" });
            port_ip34w2ny0.on("change", (a, v) => { innerOut_ip34w2ny0.set(a); });

            const innerOut_wiikdxo89 = addedOps[i].outTrigger("innerOut_wiikdxo89");
            innerOut_wiikdxo89.setUiAttribs({ "title": "exe" });
            port_wiikdxo89.onTriggered = () => { innerOut_wiikdxo89.trigger(); };

            const innerOut_s0ddunhhz = addedOps[i].outNumber("innerOut_s0ddunhhz");
            innerOut_s0ddunhhz.set(port_s0ddunhhz.get());
            innerOut_s0ddunhhz.setUiAttribs({ "title": "Duration" });
            port_s0ddunhhz.on("change", (a, v) => { innerOut_s0ddunhhz.set(a); });
        }
        if (addedOps[i].innerOutput)
        {
            const innerIn_4gu5lv66h = addedOps[i].inFloat("innerIn_4gu5lv66h");
            innerIn_4gu5lv66h.setUiAttribs({ "title": "Out Value" });
            innerIn_4gu5lv66h.on("change", (a, v) => { port_4gu5lv66h.set(a); });

            const innerIn_qutsn94pc = addedOps[i].inTrigger("innerIn_qutsn94pc");
            innerIn_qutsn94pc.setUiAttribs({ "title": "Trigger 0" });
            innerIn_qutsn94pc.onTriggered = () => { port_qutsn94pc.trigger(); };

            const innerIn_8xpkgorjm = addedOps[i].inTrigger("innerIn_8xpkgorjm");
            innerIn_8xpkgorjm.setUiAttribs({ "title": "Trigger 1" });
            innerIn_8xpkgorjm.onTriggered = () => { port_8xpkgorjm.trigger(); };

            const innerIn_hvyzlh9o8 = addedOps[i].inTrigger("innerIn_hvyzlh9o8");
            innerIn_hvyzlh9o8.setUiAttribs({ "title": "Trigger 2" });
            innerIn_hvyzlh9o8.onTriggered = () => { port_hvyzlh9o8.trigger(); };

            const innerIn_367wv95xd = addedOps[i].inTrigger("innerIn_367wv95xd");
            innerIn_367wv95xd.setUiAttribs({ "title": "Trigger 3" });
            innerIn_367wv95xd.onTriggered = () => { port_367wv95xd.trigger(); };

            const innerIn_7ju3j2fy0 = addedOps[i].inTrigger("innerIn_7ju3j2fy0");
            innerIn_7ju3j2fy0.setUiAttribs({ "title": "Trigger 4" });
            innerIn_7ju3j2fy0.onTriggered = () => { port_7ju3j2fy0.trigger(); };

            const innerIn_t8dvyjuoq = addedOps[i].inTrigger("innerIn_t8dvyjuoq");
            innerIn_t8dvyjuoq.setUiAttribs({ "title": "Trigger 5" });
            innerIn_t8dvyjuoq.onTriggered = () => { port_t8dvyjuoq.trigger(); };

            const innerIn_72naih78e = addedOps[i].inTrigger("innerIn_72naih78e");
            innerIn_72naih78e.setUiAttribs({ "title": "Trigger 6" });
            innerIn_72naih78e.onTriggered = () => { port_72naih78e.trigger(); };

            const innerIn_0s04tm21u = addedOps[i].inTrigger("innerIn_0s04tm21u");
            innerIn_0s04tm21u.setUiAttribs({ "title": "Trigger 7" });
            innerIn_0s04tm21u.onTriggered = () => { port_0s04tm21u.trigger(); };

            const innerIn_93jpxulns = addedOps[i].inTrigger("innerIn_93jpxulns");
            innerIn_93jpxulns.setUiAttribs({ "title": "Trigger 8" });
            innerIn_93jpxulns.onTriggered = () => { port_93jpxulns.trigger(); };

            const innerIn_a0w7orgi8 = addedOps[i].inTrigger("innerIn_a0w7orgi8");
            innerIn_a0w7orgi8.setUiAttribs({ "title": "Trigger 9" });
            innerIn_a0w7orgi8.onTriggered = () => { port_a0w7orgi8.trigger(); };

            const innerIn_r8h4qx4z8 = addedOps[i].inTrigger("innerIn_r8h4qx4z8");
            innerIn_r8h4qx4z8.setUiAttribs({ "title": "Trigger 10" });
            innerIn_r8h4qx4z8.onTriggered = () => { port_r8h4qx4z8.trigger(); };

            const innerIn_cr80a86xi = addedOps[i].inTrigger("innerIn_cr80a86xi");
            innerIn_cr80a86xi.setUiAttribs({ "title": "Trigger 11" });
            innerIn_cr80a86xi.onTriggered = () => { port_cr80a86xi.trigger(); };
        }
    }
};
