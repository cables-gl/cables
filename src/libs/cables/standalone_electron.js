import { CONSTANTS } from "../../core/constants.js";

const StandaloneElectron = class
{
    constructor(op)
    {
        this.hello = "world";

        op.isElectron = () =>
        {
            return CABLES.platform.frontendOptions.isStandalone;
        };
    }
};

CABLES.StandaloneElectron = StandaloneElectron;
