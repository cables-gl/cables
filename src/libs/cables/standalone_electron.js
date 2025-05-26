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
