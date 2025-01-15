const StandaloneElectron = class
{
    constructor(op)
    {
        this.hello = "world";

        op.isElectron = () =>
        {
            return CABLES.platform.frontendOptions.isElectron;
        };
    }
};

CABLES.StandaloneElectron = StandaloneElectron;
