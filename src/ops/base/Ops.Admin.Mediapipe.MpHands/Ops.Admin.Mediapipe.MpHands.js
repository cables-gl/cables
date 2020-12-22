const
    upd=op.inTrigger("Update"),
    inEle=op.inObject("Element"),
    outPoints=op.outArray("Points"),
    outLines=op.outArray("Lines"),
    outPoints2=op.outArray("Points 2"),
    outLines2=op.outArray("Lines 2"),
    outResult=op.outObject("Result"),
    next=op.outTrigger("Next");

const hands = new Hands({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.1/${file}`;
}});

let camera=null;


inEle.onChange=()=>
{

if(!inEle.get())return;

    camera = new Camera(inEle.get(), {
      onFrame: async () => {
        await hands.send({image: inEle.get()});
      },
      width: 1280,
      height: 720
    });
    camera.start();

    // if(inEle.get())
        // hands.send({image: inEle.get()});
};

upd.onTriggered=()=>
{
        // if(inEle.get())
// {
// async() => {
    // await
    // hands.send({image: inEle.get()});
//   }

// }

        // await

    next.trigger();

};

function getLines(points)
{
    const lines=[];
    lines.push( points[0*3+0],points[0*3+1],points[0*3+2]);  // thumb
    lines.push( points[1*3+0],points[1*3+1],points[1*3+2]);
    lines.push( points[1*3+0],points[1*3+1],points[1*3+2]);
    lines.push( points[2*3+0],points[2*3+1],points[2*3+2]);
    lines.push( points[2*3+0],points[2*3+1],points[2*3+2]);
    lines.push( points[3*3+0],points[3*3+1],points[3*3+2]);
    lines.push( points[3*3+0],points[3*3+1],points[3*3+2]);
    lines.push( points[4*3+0],points[4*3+1],points[4*3+2]);


    lines.push( points[0*3+0],points[0*3+1],points[0*3+2]); //wrist
    lines.push( points[5*3+0],points[5*3+1],points[5*3+2]);
    lines.push( points[5*3+0],points[5*3+1],points[5*3+2]);
    lines.push( points[9*3+0],points[9*3+1],points[9*3+2]);
    lines.push( points[9*3+0],points[9*3+1],points[9*3+2]);
    lines.push( points[13*3+0],points[13*3+1],points[13*3+2]);
    lines.push( points[13*3+0],points[13*3+1],points[13*3+2]);
    lines.push( points[17*3+0],points[17*3+1],points[17*3+2]);
    lines.push( points[17*3+0],points[17*3+1],points[17*3+2]);
    lines.push( points[0*3+0],points[0*3+1],points[0*3+2]);

    lines.push( points[5*3+0],points[5*3+1],points[5*3+2]); // index finger
    lines.push( points[6*3+0],points[6*3+1],points[6*3+2]);
    lines.push( points[6*3+0],points[6*3+1],points[6*3+2]);
    lines.push( points[7*3+0],points[7*3+1],points[7*3+2]);
    lines.push( points[7*3+0],points[7*3+1],points[7*3+2]);
    lines.push( points[8*3+0],points[8*3+1],points[8*3+2]);

    lines.push( points[9*3+0],points[9*3+1],points[9*3+2]); // middle finger
    lines.push( points[10*3+0],points[10*3+1],points[10*3+2]);
    lines.push( points[10*3+0],points[10*3+1],points[10*3+2]);
    lines.push( points[11*3+0],points[11*3+1],points[11*3+2]);
    lines.push( points[11*3+0],points[11*3+1],points[11*3+2]);
    lines.push( points[12*3+0],points[12*3+1],points[12*3+2]);

    lines.push( points[13*3+0],points[13*3+1],points[13*3+2]); // ring finger
    lines.push( points[14*3+0],points[14*3+1],points[14*3+2]);
    lines.push( points[14*3+0],points[14*3+1],points[14*3+2]);
    lines.push( points[15*3+0],points[15*3+1],points[15*3+2]);
    lines.push( points[15*3+0],points[15*3+1],points[15*3+2]);
    lines.push( points[16*3+0],points[16*3+1],points[16*3+2]);

    lines.push( points[17*3+0],points[17*3+1],points[17*3+2]); // ring finger
    lines.push( points[18*3+0],points[18*3+1],points[18*3+2]);
    lines.push( points[18*3+0],points[18*3+1],points[18*3+2]);
    lines.push( points[19*3+0],points[19*3+1],points[19*3+2]);
    lines.push( points[19*3+0],points[19*3+1],points[19*3+2]);
    lines.push( points[20*3+0],points[20*3+1],points[20*3+2]);

    return lines;
}


hands.setOptions({
  maxNumHands: 2,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
  hands.onResults((r)=>
{
    // console.log(r);

    let points=[];
    let points2=[];
    let lines=null;
    let lines2=null;

    if(r && r.multiHandLandmarks && r.multiHandLandmarks[0])
    {
        for(let i=0;i<r.multiHandLandmarks[0].length;i++)
        {
            points[i*3]=(r.multiHandLandmarks[0][i].x-0.5)*2.0*1.77777;
            points[i*3+1]=-1*(r.multiHandLandmarks[0][i].y-0.5)*2.0;
            points[i*3+2]=0;
        }
        lines=getLines(points);
    }

    if(r && r.multiHandLandmarks && r.multiHandLandmarks[1])
    {
        for(let i=0;i<r.multiHandLandmarks[1].length;i++)
        {
            points2[i*3]=(r.multiHandLandmarks[1][i].x-0.5)*2.0*1.77777;
            points2[i*3+1]=-1*(r.multiHandLandmarks[1][i].y-0.5)*2.0;
            points2[i*3+2]=0;
        }
        lines2=getLines(points2);
    }

    outResult.set(r);

    outPoints.set(points);
    outPoints2.set(points2);
    outLines.set(lines);
    outLines2.set(lines2);

});


