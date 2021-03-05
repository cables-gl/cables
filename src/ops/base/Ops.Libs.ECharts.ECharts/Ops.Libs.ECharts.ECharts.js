// I/O
const inParent = op.inObject("Parent DOM element");
const inId = op.inString("Id");
const inWidth = op.inInt("Width", 640);
const inHeight = op.inInt("Height", 480);
const chartOpts = op.inObject("Chart Options");

const themeSelect = op.inSwitch("Theme", ['default','light','dark'],'dark');
const customTheme = op.inObject("Custom theme obj");
const extraOpts = op.inObject("Extra Options");
const inStyle = op.inValueEditor("Style", "position:absolute;z-index:100;background:white;", "css");
const inVisible = op.inValueBool("Visible", true);

const outElement = op.outObject("DOM Element");
const outChart = op.outObject("ECharts instance");
const outThemeTrig = op.outTrigger("Theme changed");

const DEFAULT_THEME = 0;
const DARK_THEME = 1;
const CUSTOM_THEME = 2;

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
chartOpts.onChange = setChartOptions;
themeSelect.onChange = changeTheme;
customTheme.onChange = changeTheme;

// // Functions implementation
function main() {
    appendChartDiv();
    updateStyle();
    initChart();
    resize();

    outChart.set(chart);
    outThemeTrig.trigger();
}

function initChart() {
    if (chart) {
        chart.dispose();
        chart = null;
    }

    let theme = customTheme.get();
    if (!theme) {
        theme = themeSelect.get();
    }

    chart = echarts.init(div, theme, extraOpts.get());
    setChartOptions();
}

function changeTheme() {
    initChart();
    outChart.set(chart);

    outThemeTrig.trigger();
}

function appendChartDiv() {
    const p = inParent.get();
    if (!p) {
        canvas.append(div);
    } else {
        p.append(div);
    }
}

function setChartOptions() {
    const opts = chartOpts.get();
    if (chart && typeof opts === 'object' && opts !== 0 && opts !== null) {
        chart.setOption(opts);
    }
}

function resize() {
    const w = Math.max(0, inWidth.get());
    const h = Math.max(0, inHeight.get());

    updateStyle();
    chart.resize(w, h);
}

function setCSSVisible(visible) {
    if (!visible) {
        div.style.visibility = "hidden";
        prevDisplay = div.style.display || "block";
        div.style.display = "none";
    }
    else {
        if (prevDisplay == "none") prevDisplay = "block";
        div.style.visibility = "visible";
        div.style.display = prevDisplay;
    }
}

function updateVisibility() {
    setCSSVisible(inVisible.get());
}

function updateId() {
    div.id = inId.get();
}

function updateStyle() {
    const w = Math.max(0, inWidth.get());
    const h = Math.max(0, inHeight.get());

    let s = inStyle.get();

    if (w > 0) {
        s += "width:" + w + 'px;';
    }
    if (h > 0) {
        s += "height:" + h + 'px;';
    }

    if (s != div.style) {
        div.setAttribute("style", s);
        updateVisibility();
        outElement.set(null);
        outElement.set(div);
    }

    if (!div.parentElement) {
        canvas.appendChild(div);
    }
}

function removeElement() {
    if (chart) chart.dispose();
    if (div) div.remove();
}

main();
