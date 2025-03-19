const
    outUrl = op.outString("URL");

if (CABLES && CABLES.platform)
{
    outUrl.set(CABLES.platform.getCablesUrl());
}

// const buildInfo = CABLESUILOADER.buildInfo;
// if (buildInfo.ui && buildInfo.ui.git)
// if (buildInfo.core && buildInfo.core.git)
// if (buildInfo.api && buildInfo.api.git)
// if (buildInfo.shared && buildInfo.shared.git)
