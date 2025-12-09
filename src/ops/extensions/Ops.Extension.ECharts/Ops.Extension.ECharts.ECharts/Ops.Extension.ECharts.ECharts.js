// I/O

const createChartTrig = op.inTriggerButton("Create");
const inParent = op.inObject("Parent DOM element");
const inId = op.inString("Id");
const inWidth = op.inInt("Width", 640);
const inHeight = op.inInt("Height", 480);
const chartOpts = op.inObject("Chart Object");
const mergeOpts = op.inObject("Merge options");
const rendererSel = op.inSwitch("Renderer", ["canvas", "svg"], "canvas");
const themeSelect = op.inSwitch("Theme", ["default", "light", "dark"], "dark");
const customTheme = op.inObject("Custom theme obj");
const inInitExtraOpts = op.inObject("Init extra Options");
const inStyle = op.inValueEditor("Style", "position:absolute;\nz-index:100;\nbackground:white;", "inline-css");
const inVisible = op.inValueBool("Visible", true);

const outElement = op.outObject("DOM Element");
const outChart = op.outObject("ECharts instance");
const outChartUpdated = op.outTrigger("Chart updated");
const outThemeTrig = op.outTrigger("Theme changed");

const DEFAULT_THEME = 0;
const DARK_THEME = 1;
const CUSTOM_THEME = 2;

let loaded = false;

// Core variables
const div = document.createElement("div");
div.dataset.op = op.id;

const canvas = op.patch.cgl.canvas.parentElement;
let chart = null;
let prevDisplay = "block";

// Function binding
op.onDelete = removeElement;

inParent.onChange = appendChartDiv;
inStyle.onChange = updateStyle;
inVisible.onChange = updateVisibility;
inId.onChange = updateId;
inWidth.onChange = resize;
inHeight.onChange = resize;
chartOpts.onChange = updateChart;
mergeOpts.onChange = updateChart;
themeSelect.onChange = changeTheme;
customTheme.onChange = changeTheme;
rendererSel.onChange = changeRenderer;

// // Functions implementation

function isValidObj(obj)
{
    if (obj && typeof obj === "object" && obj !== 0 && obj !== null)
        return true;
    return false;
}

function main()
{
    appendChartDiv();
    updateStyle();

    loaded = true;
    initChart();
    resize();

    outChart.set(chart);
    outThemeTrig.trigger();
    outChartUpdated.trigger();
}

function initChart()
{
    if (!loaded) return;

    if (chart)
    {
        chart.dispose();
        chart = null;
    }

    let theme = customTheme.get();
    if (!theme)
    {
        theme = themeSelect.get();
    }

    let extra = inInitExtraOpts.get();
    if (!isValidObj(extra))
    {
        const rend = rendererSel.get();
        extra = {
            "renderer": rend
        };
    }

    chart = echarts.init(div, theme, extra);
    setChartOptions();
}

function changeRenderer()
{
    initChart();
    outChart.set(chart);
    outChartUpdated.trigger();
}

function changeTheme()
{
    initChart();
    outChart.set(chart);
    outThemeTrig.trigger();
    outChartUpdated.trigger();
}

function appendChartDiv()
{
    const p = inParent.get();
    if (!p)
    {
        canvas.append(div);
    }
    else
    {
        p.append(div);
    }
}

function setChartOptions()
{
    // https://echarts.apache.org/en/api.html#echartsInstance.setOption
    const opts = chartOpts.get();
    const merge = mergeOpts.get();

    if (!chart) return;

    if (isValidObj(opts))
    {
        if (isValidObj(merge))
        {
            chart.setOption(opts, merge);
        }
        else
        {
            chart.setOption(opts, false, true);
        }
    }
}

function updateChart()
{
    setChartOptions();
    outChartUpdated.trigger();
}

function resize()
{
    const w = Math.max(0, inWidth.get());
    const h = Math.max(0, inHeight.get());

    updateStyle();

    if (chart)
        chart.resize(w, h);
}

function setCSSVisible(visible)
{
    if (!visible)
    {
        div.style.visibility = "hidden";
        prevDisplay = div.style.display || "block";
        div.style.display = "none";
    }
    else
    {
        if (prevDisplay == "none") prevDisplay = "block";
        div.style.visibility = "visible";
        div.style.display = prevDisplay;
    }
}

function updateVisibility()
{
    setCSSVisible(inVisible.get());
}

function updateId()
{
    div.id = inId.get();
}

function updateStyle()
{
    const w = Math.max(0, inWidth.get());
    const h = Math.max(0, inHeight.get());

    let s = inStyle.get();

    if (w > 0)
    {
        s += "width:" + w + "px;";
    }
    if (h > 0)
    {
        s += "height:" + h + "px;";
    }

    if (s != div.style)
    {
        div.setAttribute("style", s);
        updateVisibility();
        outElement.set(null);
        outElement.set(div);
    }

    if (!div.parentElement)
    {
        canvas.appendChild(div);
    }
}

function removeElement()
{
    if (chart) chart.dispose();
    if (div) div.remove();
}

createChartTrig.onTriggered = main;
