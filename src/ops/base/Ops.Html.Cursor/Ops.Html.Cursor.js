op.name='Cursor';

var cursorPort = op.addInPort(new Port(op,"cursor",OP_PORT_TYPE_VALUE,{display:'dropdown',values:["auto","crosshair","pointer","Hand","move","n-resize","ne-resize","e-resize","se-resize","s-resize","sw-resize","w-resize","nw-resize","text","wait","help", "none (semi-transparent pixel)", "none (transparent pixel)", "none"]} ));
var oldCursor = '';
var cgl = op.patch.cgl;

// 1x1 pixel, opacity: 0.01 (sometimes this is needed)
var semiTransparentPixel = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAIAAAgABJ60+RsAAAAASUVORK5CYII=);";

var transparentPixel = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=);";

function update() {
    var cursor = cursorPort.get();
    if(cursor != oldCursor) {
        if(cursor === "none (semi-transparent pixel)") {
            cgl.canvas.style.cursor = semiTransparentPixel;
        } else if(cursor === "none (transparent pixel)") {
            cgl.canvas.style.cursor = transparentPixel;
        } else {
            cgl.canvas.style.cursor = cursor;
        }
        oldCursor = cursor;
    }
}

cursorPort.onChange = update;
