op.name="Inertia Anim";

var value=op.inValue("Value",0);
var result=op.outValue("Result");

var release=op.inFunction("Release");

var anim=new CABLES.InertiaAnim(inertiaUpdate);
var releaseTimeout=0;


// var scrollVal=0;

function updateValue()
{
}

function inertiaUpdate()
{
    // op.log(123,v);
    // scrollVal+=((anim.value||0)+0.0000000001);
    // updateValue();
    result.set(anim.value);
        // result.set(anim.value);

}

release.onTriggered=function()
{
    anim.release();
    
};

var last=0;

value.onChange=function()
{
    clearTimeout(releaseTimeout);
    anim.set(value.get());
    updateValue();
    
    
    // release
    if(!release.isLinked())
    {
        op.log('inertia auto release');
        releaseTimeout=setTimeout(function()
        {
            anim.release();
        },66.4);
    }

    
};