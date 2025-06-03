export class StandaloneElectron
{
    constructor(op)
    {
        this.hello = "world";

        op.isElectron = () =>
        {
            return CABLES.platform.frontendOptions.isElectron;
        };
    }
}

// do not remove this: workaround to not change corelib filename but still have this in CABLES namespace
CABLES.StandaloneElectron = StandaloneElectron;
