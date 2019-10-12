const
    inExec=op.inTrigger("Execute"),
    inName=op.inString("Name"),
    outNext=op.outTrigger("Childs"),
    outUsed=op.outValue("Time Used")
    ;

inExec.onTriggered=update;

// var Measurement=function(_name)
// {
//     this.name=_name;
//     this.childs=[];
//     this.used=0;
//     this.lastTime=performance.now();
//     this.colR=Math.floor(Math.random()*100)+128;
//     this.colG=Math.floor(Math.random()*100)+128;
//     this.colB=Math.floor(Math.random()*100)+128;
// };


// inExec.onLinkChanged=removeEle;
// outNext.onLinkChanged=removeEle;
// op.onDelete=removeEle;

// function removeEle()
// {
//     theMeasure.used=0;
//     if(theMeasure.ele)
//         theMeasure.ele.remove();

//     theMeasure.ele=null;
// };

// inName.onChange=function()
// {
//     theMeasure.name=inName.get();
//     removeEle();
// };

// var theMeasure=new Measurement("m");

function update()
{

    // if(!CGL.performanceMeasures||CGL.performanceMeasures.length===0)
    // {

    //     CGL.rootMeasure=CGL.rootMeasure||new Measurement("Root");
    //     CGL.rootMeasure.isRoot=true;
    //     CGL.performanceMeasures=[];
    //     CGL.performanceMeasures.push(CGL.rootMeasure);
    //     CGL.currentPerfMeasurement=CGL.performanceMeasures[0];
    // }

    // theMeasure.childs.length=0;
    // var prevMeasure=CGL.currentPerfMeasurement;

    // CGL.currentPerfMeasurement.childs.push(theMeasure);
    // CGL.currentPerfMeasurement=theMeasure;
    const startTime=performance.now();
    outNext.trigger();
    const used=performance.now()-startTime;
    // theMeasure.used=(theMeasure.used*0.8+used*0.2);
    // theMeasure.used=used;
    // theMeasure.lastTime=performance.now();

    // CGL.currentPerfMeasurement=prevMeasure;
    outUsed.set(used);
}



