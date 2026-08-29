import { CONSTANTS, Op, Port } from "cables";
import { ShaderGraphProgram } from "./shadergraphprogram.js";

export class ShaderGraphOp
{

    /**
     * @param {Op} op
     * @param {import("./shadergraphprogram.js").ShaderNode} shaderNode
     */
    constructor(op, shaderNode)
    {
        op.sgOp = this;
        this.op = op;
        this._inPorts = [];
        this._outPorts = [];
        this._defines = [];
        this.enabled = true;
        this.info = null;

        shaderNode.id = ShaderGraphProgram.getNewId();

        op.shaderNode = shaderNode;
        op.updateGraph = this.updateGraph.bind(this);

        this.op.on("onLinkChanged", this.updateGraph.bind(this));
        this.updateGraph();
        this.addPortWatcher();

    }

    addPortWatcher()
    {
        for (let i = 0; i < this.op.portsIn.length; i++)
        {
            if (this.op.portsIn[i].type != CONSTANTS.OP.OP_PORT_TYPE_OBJECT) continue;

            if (this.op.portsIn[i].uiAttribs.objType && this.op.portsIn[i].uiAttribs.objType.indexOf("sg_") == 0)
                this.op.portsIn[i].setUiAttribs({ "display": "sg_vec" });

            this.op.portsIn[i].on("change", this.updateGraph.bind(this));
        }
    }

    /**
     * @param {string} name
     */
    getResult(name)
    {
        let parmnames = "";
        const shaderNode = this.op.shaderNode;
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
        const shaderNode = this.op.shaderNode;

        if (shaderNode.result && !shaderNode.results)
        {
            console.warn("PARAM HAS no resultS", this.op.name);
            shaderNode.results = [shaderNode.result];
            delete shaderNode.result;

        }

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
                // if (param.type == "gen")console.warn("PARAM TYPE STILL GEN!!!!!!");

                // if (shaderNode.params[i].port)
                param.port.setUiAttribs({ "objType": "sg_" + param.type });

            }

        }

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

                    const t = ShaderGraphProgram.getMaxGenTypeFromInputParams(shaderNode.params);
                    param.type = t;
                }
                if (param.type == "gen")console.warn("PARAM TYPE STILL GEN!!!!!!");

                param.port.setUiAttribs({ "objType": "sg_" + param.type });

            }

            shaderNode.results[i].port.setUiAttribs({ "objType": "sg_" + shaderNode.results[i].type });
        }
        // shaderNode.result.port.setUiAttribs({ "objType": "sg_" + shaderNode.result.type });

        for (let i = 0; i < this.op.portsOut.length; i++)
        {
            if (this.op.portsOut[i].type != CONSTANTS.OP.OP_PORT_TYPE_OBJECT) continue;
            this.op.portsOut[i].setRef({});
        }
    }

}
