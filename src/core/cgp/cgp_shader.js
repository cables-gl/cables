import Logger from "../../../../cables_ui/src/ui/utils/logger";
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

        this.shaderModule = null;
    }

    isValid()
    {
        return this._isValid;
    }

    getName()
    {
        return this._name;
    }
}
