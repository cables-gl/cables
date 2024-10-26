const
    inLoadingTask = op.inBool("Loading Task", false),
    inUiLoading = op.inBool("Loading", false),
    inWarning1 = op.inBool("Warning", false),
    inUiError = op.inBool("Error", false),
    inUiHint = op.inBool("Hint", false),
    inNotWorking = op.inBool("Not Working", false),
    innum = op.inFloatSlider("Slider", 0),
    inGrad = op.inGradient("Gradient"),
    inResize = op.inBool("Resizable"),
    trig = op.inTrigger("trigger"),

    inSwit = op.inBool("greyout"),
    ingreyoutLine = op.inFloatSlider("this will greyout"),

    inLog = op.inTriggerButton("op.log()"),
    inLogWarn = op.inTriggerButton("op.logWarn()"),
    inLogErr = op.inTriggerButton("op.logError()"),

    inPrompt = op.inTriggerButton("Open Prompt"),
    inModal = op.inTriggerButton("Open Modal"),
    inTab = op.inTriggerButton("Open new Tab"),

    outBlah = op.outNumber("Something");

op.setPortGroup("Greyout", [inSwit, ingreyoutLine]);
op.setPortGroup("Warnings", [inWarning1, inUiHint, inUiError, inNotWorking]);
op.setPortGroup("Logging", [inLog, inLogWarn, inLogErr]);
op.setPortGroup("Modal", [inPrompt, inModal]);

let loadingId = null;

op.onDelete = () =>
{
    if (loadingId) op.patch.loading.finished(loadingId);
};

inUiLoading.onChange = () =>
{
    op.setUiAttribs({ "loading": inUiLoading.get() });
};

inSwit.onChange = () =>
{
    ingreyoutLine.setUiAttribs({ "greyout": inSwit.get() });
};

inLoadingTask.onChange = () =>
{
    if (inLoadingTask.get()) loadingId = op.patch.loading.start("test ui op file", "uiTestOp.txt");
    else
    {
        op.patch.loading.finished(loadingId);
        loadingId = null;
    }
};

inWarning1.onChange = () =>
{
    if (inWarning1.get()) op.setUiError("Warn1", "Warning one", 1);
    else op.setUiError("Warn1", null);
};

inUiHint.onChange = () =>
{
    if (inUiHint.get()) op.setUiError("Hint1", "This is a hint!", 0);
    else op.setUiError("Hint1", null);
};

inNotWorking.onChange = () =>
{
    if (inNotWorking.get()) op.setUiError("Warn3", "Warning two", 3);
    else op.setUiError("Warn3", null);
};

inUiError.onChange = () =>
{
    if (inUiError.get()) op.setUiError("Warn2", "Warning two", 2);
    else op.setUiError("Warn2", null);
};

innum.onChange = () =>
{
    const q = innum.get();

    if (q < 0.3) op.setUiError("qRange", "number to small", 1);
    else if (q > 0.6) op.setUiError("qRange", "number to big", 1);
    else
    {
        op.log("no error!");
        op.setUiError("qRange", null);
    }
    op.log(q);
};

inLog.onTriggered = () =>
{
    // if you dont see this open the logging filter
    // by pressing cmd/ctrl+p "logging"
    // and deactivate the filter for this op name.
    op.log("this is verbose logging!");
};

inLogWarn.onTriggered = () =>
{
    op.logWarn("this is a warning!");
};

inLogErr.onTriggered = () =>
{
    op.logError("this is an error!");
};

inPrompt.onTriggered = () =>
{
    new CABLES.UI.ModalDialog({
        "prompt": true,
        "title": "How Much",
        "text": "please enter something",
        "promptValue": "default",
        "promptOk": (v) =>
        {
            op.log("yes! prompt finished", v);
        }
    });
};

inResize.onChange = () =>
{
    op.setUiAttrib({ "resizable": inResize.get() });
};

inModal.onTriggered = () =>
{
    new CABLES.UI.ModalDialog({
        "title": "Title",
        "text": "Dialog content <b>can be <i>html</i><b>"
    });
};

inTab.onTriggered = () =>
{
    const tab = new CABLES.UI.Tab("Example",
        {
            "icon": "cube",
            "padding": true,
            "singleton": false
        });

    gui.mainTabs.addTab(tab, true);
    tab.addEventListener("close", () => { op.log("tab was closed!"); });
    tab.html("this is the tab content. ");
    gui.maintabPanel.show(true);
};
