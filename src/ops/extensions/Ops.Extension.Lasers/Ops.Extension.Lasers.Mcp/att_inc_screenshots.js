// screenshots of the canvas, the patch field and the timeline

// converts a png blob to base64 (without data: prefix), downscaled so its longer edge is at most maxSize
// to keep the image (and its token cost) small; maxSize 0 = keep original size
async function blobToPng(blob, maxSize)
{
    const img = await createImageBitmap(blob);
    const longEdge = Math.max(img.width, img.height);
    const scale = maxSize && longEdge > maxSize ? maxSize / longEdge : 1;

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    img.close();

    return canvas.toDataURL("image/png").split(",")[1];
}

// renders a frame and captures it right away with the renderer's own screenshot function (the same as the
// "save screenshot" command), so the canvas still holds the rendered image instead of an already cleared buffer
function grabScreenshot(maxSize)
{
    return new Promise((resolve, reject) =>
    {
        const cg = gui.canvasManager.currentContextCg() || CABLES.patch.cgl;
        if (!cg || !cg.screenShot) { reject(new Error("no rendering context with a screenshot function found")); return; }

        cg.patch.renderOneFrame();
        cg.screenShot((blob) =>
        {
            if (!blob) { reject(new Error("screenshot returned no image")); return; }
            blobToPng(blob, maxSize).then(resolve, reject);
        }, false, "image/png");
    });
}

// captures the patch field (the glpatch canvas) right after its next rendered frame, while the drawing buffer still holds the image
function grabPatchFieldScreenshot(maxSize)
{
    return new Promise((resolve, reject) =>
    {
        const cgl = gui.patchView.patchRenderer.cgl;
        const timeout = setTimeout(() =>
        {
            cgl.off(listener);
            reject(new Error("patch field did not render a frame"));
        }, PATCHFIELD_FRAME_TIMEOUT_MS);

        const listener = cgl.on("endFrame", () =>
        {
            clearTimeout(timeout);
            setTimeout(() => { cgl.off(listener); }, 0);
            cgl.screenShot((blob) =>
            {
                if (!blob) { reject(new Error("screenshot returned no image")); return; }
                addVizLayer(blob).then((withViz) => { return blobToPng(withViz, maxSize); }).then(resolve, reject);
            }, false, "image/png");
        });
    });
}

// draws the viz layer canvas (image previews, tables, graphs of Ops.Ui.Viz* ops) on top of a patch field screenshot
async function addVizLayer(blob)
{
    const vizLayer = gui.patchView.patchRenderer.vizLayer;
    const vizCanvas = vizLayer ? vizLayer._eleCanvas : null;
    if (!vizCanvas || !vizCanvas.width || !vizCanvas.height) return blob;

    const img = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    ctx.drawImage(vizCanvas, 0, 0, img.width, img.height);
    img.close();

    return new Promise((resolve) => { canvas.toBlob(resolve, "image/png"); });
}

// captures the timeline canvas right after a frame it renders; only the gl part, the html line titles on top are not in the image
function grabTimelineScreenshot(maxSize)
{
    return new Promise((resolve, reject) =>
    {
        const glTimeline = gui.glTimeline;
        if (!glTimeline) { reject(new Error("timeline is not open, run the command \"Show timeline\" first")); return; }

        const cgl = glTimeline.cgl;
        const timeout = setTimeout(() =>
        {
            cgl.off(listener);
            reject(new Error("timeline did not render a frame"));
        }, PATCHFIELD_FRAME_TIMEOUT_MS);

        const listener = cgl.on("endFrame", () =>
        {
            clearTimeout(timeout);
            setTimeout(() => { cgl.off(listener); }, 0);
            cgl.screenShot((blob) =>
            {
                if (!blob) { reject(new Error("screenshot returned no image")); return; }
                blobToPng(blob, maxSize).then(resolve, reject);
            }, false, "image/png");
        });

        glTimeline.needsUpdateAll = "mcp screenshot";
    });
}

// pixel size of something that can be drawn with drawImage, or null if it is not drawable (yet)
function getDrawableSize(value)
{
    if (value instanceof HTMLVideoElement) return value.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA ? { "width": value.videoWidth, "height": value.videoHeight } : null;
    if (value instanceof HTMLImageElement) return value.complete ? { "width": value.naturalWidth, "height": value.naturalHeight } : null;
    return { "width": value.width, "height": value.height };
}

function isDrawable(value)
{
    return value instanceof HTMLVideoElement || value instanceof HTMLImageElement || value instanceof HTMLCanvasElement || value instanceof ImageBitmap || value instanceof OffscreenCanvas;
}

// copies a canvas/image/video/bitmap into a png, downscaled so its longer edge is at most maxSize (0 = original size)
function drawableToPng(drawable, size, maxSize)
{
    const longEdge = Math.max(size.width, size.height);
    const scale = maxSize && longEdge > maxSize ? maxSize / longEdge : 1;

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(size.width * scale));
    canvas.height = Math.max(1, Math.round(size.height * scale));
    canvas.getContext("2d").drawImage(drawable, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/png").split(",")[1];
}

// tag, id, classes, size on screen, whether it is in the document and the inline style of an html element
function describeElementInfo(ele)
{
    const lines = ["<" + ele.tagName.toLowerCase() + ">"];
    if (ele.id) lines.push("id: " + ele.id);
    if (ele.className && typeof ele.className == "string") lines.push("class: " + ele.className);

    const rect = ele.getBoundingClientRect();
    lines.push("client rect: x " + Math.round(rect.x) + ", y " + Math.round(rect.y) + ", " + Math.round(rect.width) + "x" + Math.round(rect.height));
    lines.push("in document: " + ele.isConnected);
    if (ele.getAttribute("style")) lines.push("style: " + ele.getAttribute("style"));

    return lines.join("\n");
}

// the element info plus its outer html, shortened to ELEMENT_HTML_MAX_LENGTH
function describeElement(ele)
{
    let html = ele.outerHTML;
    if (html.length > ELEMENT_HTML_MAX_LENGTH) html = html.substring(0, ELEMENT_HTML_MAX_LENGTH) + "... (" + ele.outerHTML.length + " chars)";
    return describeElementInfo(ele) + "\nhtml: " + html;
}

// registers the tools of this file, called by buildMcpServer
function registerScreenshotTools(server)
{
    server.tool(
        "inspect-element-port",
        "inspect the html element in an object port of an op (input or output), e.g. a canvas2d Element output or an image element. canvas, image, video and image bitmap values are returned as a png image plus their size, other html elements as text: tag, id, class, client rect, style and shortened outer html. maxSize limits the longer edge of the image in pixels (default " + SCREENSHOT_DEFAULT_MAX_SIZE + ", 0 = original size). stackKey inspects a hidden copy of a stacked op.", { "opId": param.opId(), "portName": param.portName().describe("name of an object port holding an html element, e.g. \"Element\""), "maxSize": param.maxSize(), "stackKey": param.stackKey() },
        async ({ opId, portName, maxSize, stackKey }) =>
        {
            logMcp("inspect element port " + opLabel(opId) + "." + portName + (stackKey ? " copy " + stackKey : ""));

            const headOp = CABLES.patch.getOpById(opId);
            if (!headOp) return respondError("no op found with id " + opId);

            const target = getStackTarget(headOp, stackKey);
            if (target.error) return respondError(target.error);
            const o = target.op;

            const port = o.getPort(portName);
            if (!port) return respondError("op " + opLabel(opId) + " has no port " + portName);

            const value = stackKey ? port.value : port.get();
            if (!value) return respondText("port " + portName + " is empty");

            if (isDrawable(value))
            {
                const size = getDrawableSize(value);
                let info = value.constructor.name + (size ? " " + size.width + "x" + size.height : " (not loaded yet)");
                if (value instanceof Element) info += "\n" + describeElementInfo(value);
                if (!size || size.width == 0 || size.height == 0) return respondText(info + "\nnothing to show, the image has no pixels");

                try
                {
                    const png = drawableToPng(value, size, maxSize ?? SCREENSHOT_DEFAULT_MAX_SIZE);
                    return respond({ "content": [{ "type": "text", "text": info }, { "type": "image", "data": png, "mimeType": "image/png" }] });
                }
                catch (e)
                {
                    return respondError(info + "\ncould not read pixels: " + e.message);
                }
            }

            if (value instanceof Element) return respondText(describeElement(value));

            return respondText("port " + portName + " holds no html element but " + (value.constructor ? value.constructor.name : typeof value));
        }
    );

    server.tool(
        "screenshot",
        "take a screenshot of the patch's webgl rendering canvas and return it as a png image; use it to check what a change looks like. html elements and 2d canvases on top of it are not in the image, use inspect-element-port for those. maxSize limits the longer edge in pixels (default " + SCREENSHOT_DEFAULT_MAX_SIZE + ", 0 = original size); larger images cost more tokens.", { "maxSize": param.maxSize() },
        async ({ maxSize }) =>
        {
            logMcp("screenshot");

            try
            {
                const png = await grabScreenshot(maxSize ?? SCREENSHOT_DEFAULT_MAX_SIZE);
                return respond({ "content": [{ "type": "image", "data": png, "mimeType": "image/png" }] });
            }
            catch (e)
            {
                return respondError("screenshot failed: " + e.message);
            }
        }
    );

    server.tool(
        "patch-field-screenshot",
        "take a screenshot of the patch field (the editor's op graph with ops and links, not the rendering canvas) as a png image, at most " + PATCHFIELD_SCREENSHOT_MAX_SIZE + " pixels on the longer edge. maxSize can make it smaller, never bigger. use patch-view to scroll/zoom first; panels on top of the patch field are not in the image.", { "maxSize": z.number().optional().describe("longest edge of the returned image in pixels, at most and default " + PATCHFIELD_SCREENSHOT_MAX_SIZE) },
        async ({ maxSize }) =>
        {
            logMcp("patch field screenshot");

            let size = PATCHFIELD_SCREENSHOT_MAX_SIZE;
            if (maxSize > 0) size = Math.min(maxSize, PATCHFIELD_SCREENSHOT_MAX_SIZE);

            try
            {
                const png = await grabPatchFieldScreenshot(size);
                return respond({ "content": [{ "type": "image", "data": png, "mimeType": "image/png" }] });
            }
            catch (e)
            {
                return respondError("patch field screenshot failed: " + e.message);
            }
        }
    );

    server.tool(
        "timeline-screenshot",
        "take a screenshot of the timeline panel (ruler, overview, keys and curves) as a png image. only the gl canvas: the html line titles and buttons are not in the image. maxSize limits the longer edge in pixels (default " + SCREENSHOT_DEFAULT_MAX_SIZE + ", 0 = original size). the timeline has to be open (command \"Show timeline\").", { "maxSize": param.maxSize() },
        async ({ maxSize }) =>
        {
            logMcp("timeline screenshot");

            try
            {
                const png = await grabTimelineScreenshot(maxSize ?? SCREENSHOT_DEFAULT_MAX_SIZE);
                return respond({ "content": [{ "type": "image", "data": png, "mimeType": "image/png" }] });
            }
            catch (e)
            {
                return respondError("timeline screenshot failed: " + e.message);
            }
        }
    );
}
