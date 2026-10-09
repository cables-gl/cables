if (CABLES.platform && CABLES.platform.frontendOptions.isElectron)
{
    const inPortList = op.inDropDown("Ports", []);
    if (CABLESUILOADER.talkerAPI)
    {
        CABLESUILOADER.talkerAPI.send(CABLESUILOADER.TalkerAPI.CMD_ELECTRON_GET_SERIAL_PORT, {}, (err, ports) =>
        {
            if (err || !ports) return;
            const portNames = ports.map((port) => { return port.portName; });
            if (inPortList.get() && !portNames.includes(inPortList.get())) portNames.push(inPortList.get());
            inPortList.setUiAttribs({ "values": portNames });
            op.refreshParams();
        });
    }

    inPortList.onChange = () =>
    {
        if (CABLESUILOADER.talkerAPI && inPortList.get()) CABLESUILOADER.talkerAPI.send(CABLESUILOADER.TalkerAPI.CMD_ELECTRON_SET_SERIAL_PORT, { "portName": inPortList.get() });
    };
}
