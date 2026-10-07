const
    outUrl = op.outString("URL");

if (CABLES && CABLES.platform)
{
    outUrl.set(CABLES.platform.getCablesUrl());
}
