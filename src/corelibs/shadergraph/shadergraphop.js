import { Op, Port } from "cables";
import { ShaderGraphProgram } from "./shadergraphprogram.js";
import { Lang } from "./lang.js";

export class ShaderGraphOp
{

    /** @type {Port[]} */
    _inPorts = [];

    /** @type {Port[]} */
    _outPorts = [];

    listeners = {};
    enabled = true;
    info = null;

    /**
     * @param {Op} op
     * @param {import("./shadergraphprogram.js").ShaderNode} shaderNode
     */
    constructor(op, shaderNode)
    {
        op.sgOp = this;
        this.op = op;

        shaderNode.id = ShaderGraphProgram.getNewId();

        op.tempData.shaderNode = shaderNode;
        op.updateGraph = this.updateGraph.bind(this);

        this.op.on("onLinkChanged", this.updateGraph.bind(this));
        this.updateGraph();

        this.addPortWatcherAll();
    }

    /**
     * @param {Port} port
     */
    addPortWatcherPort(port)
    {
        if (port.type != Port.TYPE_OBJECT) return;

        if (port.uiAttribs.objType && port.uiAttribs.objType.indexOf("sg_") == 0) port.setUiAttribs({ "display": "sg" });

        this.listeners[port.name] = port.on("change", () =>
        {
            this.updateGraph.bind(this);

            this.op.tempData.shaderNode.results[0].port.setRef({});
        });

        // this.listeners[port.name] = port.on("change", () =>
        // {
        // });
    }

    addPortWatcherAll()
    {

        for (let i = 0; i < this.op.portsIn.length; i++)
        {
            this.addPortWatcherPort(this.op.portsIn[i]);
        }
    }

    /**
     * @param {string} name
     */
    getResult(name)
    {
        let parmnames = "";
        const shaderNode = this.op.tempData.shaderNode;
        for (let i = 0; i < shaderNode.results.length; i++)
        {
            parmnames += shaderNode.results[i].name;
            if (shaderNode.results[i].name == name) return shaderNode.results[i];
        }

        if (shaderNode.results[0]) return shaderNode.results[0]; // fallback old/deprecated way

    }

    updateGraph()
    {

        /** @type {import("./shadergraphprogram.js").ShaderNode} */
        const shaderNode = this.op.tempData.shaderNode;

        if (shaderNode.hasOwnProperty("result")) console.error("PARAM HAS no resultS", this.op.name);

        if (shaderNode.params)
        {
            for (let i = 0; i < shaderNode.params.length; i++)
            {

                const param = shaderNode.params[i];
                if (!param.port) param.port = this.op.inObject(param.name, null, "sg");
                if (!param.name)param.name = param.port.name;

                if (param.gen || param.type == "gen")
                {
                    param.gen = true;

                    // 1. if linked, get result of connected port
                    // if (param.port.isLinked())
                    // {
                    //     const otherParam = ShaderGraphProgram.getParamFromPort(param.port.links[0].getOtherPort(param.port));
                    //     param.type = otherParam.type;
                    // }
                    // else
                    {
                        const t = ShaderGraphProgram.getMaxGenTypeFromInputParams(shaderNode.params);
                        // console.log("param maxgen", param.port.op.name, param.port.name, t);
                        param.type = t;
                    }

                    // 2.get max of other inputs
                }

                if (!param.port.attribs.sg)param.port.attribs.sg = Lang.floatStr(param.value || 0);

                if (!this.listeners[param.port.name]) this.addPortWatcherPort(param.port);
                param.port.setUiAttribs({ "objType": "sg_" + param.type, "display": "sg" });
            }
        }

        // this.detectLangProblems();

        for (let i = 0; i < shaderNode.results.length; i++)
        {

            if (!shaderNode.results[i].port)
                shaderNode.results[i].port = this.op.outObject(shaderNode.results[i].name, null, "sg");

            for (let i = 0; i < shaderNode.results.length; i++)
            {

                const param = shaderNode.results[i];
                if (!param.port)
                {
                    param.port = this.op.outObject(param.name, null, "sg");
                }

                if (param.gen || param.type == "gen")
                {
                    param.gen = true;
                    param.type = ShaderGraphProgram.getMaxGenTypeFromInputParams(shaderNode.params);
                }

                if (param.type == "gen")console.warn("PARAM TYPE STILL GEN!!!!!!");

                param.port.setUiAttribs({ "objType": "sg_" + param.type, "display": "sg" });

            }

            shaderNode.results[i].port.setUiAttribs({ "objType": "sg_" + shaderNode.results[i].type });
        }

        for (let i = 0; i < this.op.portsOut.length; i++)
        {
            if (this.op.portsOut[i].type != Port.TYPE_OBJECT) continue;
            this.op.portsOut[i].setRef({});
        }
    }

}
