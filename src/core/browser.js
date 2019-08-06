import CGL from "./cgl";

const Browser = function (projectId)
{
    var canceled = false;

    var hidden = "hidden";

    if (hidden in document) document.addEventListener("visibilitychange", onchange);
    else if ((hidden = "mozHidden") in document) document.addEventListener("mozvisibilitychange", onchange);
    else if ((hidden = "webkitHidden") in document) document.addEventListener("webkitvisibilitychange", onchange);
    else if ((hidden = "msHidden") in document) document.addEventListener("msvisibilitychange", onchange);
    else if ("onfocusin" in document) document.onfocusin = document.onfocusout = onchange;
    else window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;

    function onchange(evt)
    {
        canceled = true;
        console.log("browser report canceled...");
    }

    var browser = {
        nVer: navigator.appVersion,
        nAgt: navigator.userAgent,
        browserName: navigator.appName,
        fullVersion: parseFloat(navigator.appVersion),
        majorVersion: parseInt(navigator.appVersion, 10),
        lang: navigator.language,
        platform: navigator.platform,
        sizeScreen: [window.screen.availHeight, window.screen.availWidth],
        sizeWindow: [window.screen.height, window.screen.width],
    };

    this.sendReport = function (patch)
    {
        if (canceled) return;
        if (!projectId)
        {
            console.log("report canceled - no projectid");
            return;
        }
        browser.gl = {
            renderer: "unknown",
            sizeCanvas: [patch.cgl.canvas.width, patch.cgl.canvas.height],
        };

        var dbgRenderInfo = patch.cgl.gl.getExtension("WEBGL_debug_renderer_info");
        if (dbgRenderInfo)
        {
            browser.gl.renderer = patch.cgl.gl.getParameter(dbgRenderInfo.UNMASKED_RENDERER_WEBGL);
            browser.gl.vendor = patch.cgl.gl.getParameter(dbgRenderInfo.UNMASKED_VENDOR_WEBGL);
        }

        var exts = patch.cgl.gl.getSupportedExtensions();
        if (exts) browser.gl.extensions = exts;

        if (CGL.fpsReport && CGL.fpsReport.length > 1)
        {
            CGL.fpsReport.splice(0, 1);
            browser.gl.fps = CGL.fpsReport;

            CABLES.api.post(`report/${projectId}`, { report: browser });
        }
    };
};

export default Browser;
