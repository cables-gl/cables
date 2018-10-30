
var exe=op.inTriggerButton("Screenshot");
var filename=op.inValueString("Filename","cables");

var useSize=op.inValueBool("Use Canvas Size",true);

var outNext=op.outTrigger("Finished");

var width=op.inValueInt("Width",0);
var height=op.inValueInt("Height",0);

useSize.onChange=updateSizePorts;
var cgl=op.patch.cgl;
updateSizePorts();

exe.onTriggered=function()
{
    var oldHeight=cgl.canvasHeight;
    var oldWidth=cgl.canvasWidth;

    if(!useSize.get())
    {
        op.patch.pause();
        op.patch.cgl.setSize(2048,2048);
        op.patch.renderOneFrame();
    }

    cgl.saveScreenshot(
        filename.get(),
        function()
        {
            outNext.trigger();
        }
    );

    if(!useSize.get())
    {
        op.patch.cgl.setSize(oldWidth,oldHeight);
    }
    op.patch.resume();
};

function updateSizePorts()
{
    if(useSize.get())
    {
        width.setUiAttribs({hidePort:true,greyout:true});
        height.setUiAttribs({hidePort:true,greyout:true});
    }
    else
    {
        width.set(op.patch.cgl.canvasWidth);
        height.set(op.patch.cgl.canvasHeight);
        width.setUiAttribs({hidePort:false,greyout:false});
        height.setUiAttribs({hidePort:false,greyout:false});
    }
    
}
