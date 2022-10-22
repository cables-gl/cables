import Logger from "../core_logger";
import { simpleId } from "../utils";

export default class Shader
{
    constructor(_cgp, _name)
    {
        if (!_cgp) throw new Error("shader constructed without cgp " + _name);
        this._log = new Logger("cgp_shader");
        this._cgp = _cgp;
        this._name = _name;

        if (!_name) this._log.stack("no shader name given");
        this._name = _name || "unknown";
        this.id = simpleId();
        this._isValid = true;
        this._compileReason = "";
        this.shaderModule = null;
        this._needsRecompile = true;

        this._src = "";
    }

    isValid()
    {
        return this._isValid;
    }

    getName()
    {
        return this._name;
    }

    setWhyCompile(why)
    {
        this._compileReason = why;
    }

    setSource(src)
    {
        this._src = src;
        this.setWhyCompile("Source changed");
        this._needsRecompile = true;
    }

    compile()
    {
        console.log("compile shader");
        this._cgp.pushErrorScope("validation");
        this.shaderModule = this._cgp.device.createShaderModule({ "code": this._src });
        this._cgp.popErrorScope();
        this._needsRecompile = false;
    }

    bind()
    {
        if (this._needsRecompile) this.compile();
    }
}
