// your new op
// have a look at the documentation at: 
// https://docs.cables.gl/dev_hello_op/dev_hello_op.html

var exe=op.inFunctionButton("Screenshot");
var filename=op.inValueString("Filename","cables");

exe.onTriggered=function()
{
    op.patch.cgl.saveScreenshot(
        filename.get()
        // render.bind(this),
        // $('#render_width').val(),
        // $('#render_height').val()
    );

    
};