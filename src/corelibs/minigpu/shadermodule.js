/**
 * @typedef Binding
 * @property {string} header
 * @property {string} headSrc
 */

export class ShaderModule
{
    bindHeadSrc = "";
    reInit = true;
    code = "";
    codePre = "";
    updated = performance.now();

    /** @type {Binding[]} */
    bindings = [];

    /**
     * @typedef ShaderModuleOptions
     * @property {"FRAGMENT"|"VERTEX"|"COMPUTE"} stage
     */
    /**
     * @param {ShaderModuleOptions} o
     * @param {import(".").MgpuState} mgpu
     */
    constructor(mgpu, o)
    {
        this.cfg = o;
        this.format = mgpu.format;

    }

    getObjectStructure()
    {
        return {
            "layout": "auto",
            "module": this.module,
            "targets": [ // only frag??
                {
                    "format": this.format,
                    "blend":
                    {
                        "color":
                        {
                            "srcFactor": "src-alpha",
                            "dstFactor": "one-minus-src-alpha",
                            "operation": "add"
                        },
                        "alpha":
                        {
                            "srcFactor": "one",
                            "dstFactor": "one-minus-src-alpha",
                            "operation": "add"
                        }
                    }
                }
            ],
            "constants": {}// smgpu.constants
        };
    }

    create(mgpu)
    {
        this.module = mgpu.device.createShaderModule(
            {
                "code": this.genSource()
            });

        /* minimalcore:start */
        this.module.label = this.cfg.op.uiAttribs.comment || this.cfg.op.id;

        /* minimalcore:end */

    }

    genSource()
    {
        this.updated = performance.now();

        let bhead = "";
        let g = 0;
        if (this.cfg.stage == "FRAGMENT") g = 1;

        for (let i = 0; i < this.bindings.length; i++)
        {
            const b = this.bindings[i];
            if (b.headSrc)
                bhead += b.headSrc + "\n";
        }

        for (let i = 0; i < this.bindings.length; i++)
        {
            const b = this.bindings[i];
            bhead += "@group(" + g + ") @binding(" + i + ") " + b.header + "\n";
        }

        if (bhead != this.bindHeadSrc)
        {
            this.reInit = true;
            this.bindHeadSrc = bhead;
        }

        let finalCode = this.codePre + this.code;
        finalCode = finalCode.replaceAll("{{BINDINGS}}", bhead);
        return finalCode;
    }

}
