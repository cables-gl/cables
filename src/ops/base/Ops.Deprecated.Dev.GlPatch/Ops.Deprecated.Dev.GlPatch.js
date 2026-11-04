// const
//     render = op.inTrigger("Render"),
//     refresh = op.inTriggerButton("Refresh"),
//     debug = op.inTriggerButton("debug"),
//     next = op.inTrigger("Next");

// const p = new CABLES.GLGUI.GlPatch(op.patch.cgl);
// const api = new CABLES.GLGUI.GlPatchAPI(op.patch, p);

// let firstTime = true;

// refresh.onTriggered = function ()
// {
//     api.reset();
// };

// render.onTriggered = function ()
// {
//     if (firstTime)
//     {
//         api.reset();
//         firstTime = false;
//     }

//     p.render(
//         op.patch.cgl.canvasWidth,
//         op.patch.cgl.canvasHeight
//     );
//     next.trigger();
// };

// debug.onTriggered = () =>
// {
//     let count = 0;
//     for (const i in p._glOpz)
//     {
//         p._glOpz[i].updateVisible();
//         p._glOpz[i].updatePosition();

//         for (const k in p._glOpz[i]._links)
//         {
//             count++;
//             if (p._glOpz[i]._links[k]) p._glOpz[i]._links[k].update();
//             console.log(p._glOpz[i]._links[k]);

//             p._glOpz[i]._links[k]._cable.updateLineStyle();
//             p._glOpz[i]._links[k]._cable._updateLinePos();
//         }
//     }
// };
