const
    upd=op.inTrigger("Update"),
    inEle=op.inObject("Element"),
    outPoints=op.outArray("Points"),


    outResult=op.outObject("Result"),
    next=op.outTrigger("Next");

// https://google.github.io/mediapipe/solutions/face_mesh.html

let camera=null;


inEle.onChange=()=>
{

if(!inEle.get())return;

    camera = new Camera(inEle.get(), {
      onFrame: async () => {
        await faceMesh.send({image: inEle.get()});
      },
      width: 1280,
      height: 720
    });
    camera.start();

};

upd.onTriggered=()=>
{


    next.trigger();

};


const faceMesh = new FaceMesh({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
}});
faceMesh.setOptions({
  maxNumFaces: 1,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});
// faceMesh.onResults(onResults);


// hands.setOptions({
//   maxNumHands: 2,
//   minDetectionConfidence: 0.5,
//   minTrackingConfidence: 0.5
// });
faceMesh.onResults((r)=>
{
    let points=[];

    if(r && r.multiFaceLandmarks)
    {
        for(let i=0;i<r.multiFaceLandmarks[0].length;i++)
        {
            points.push(
                (r.multiFaceLandmarks[0][i].x-0.5)*2*1.77777,
                -1*(r.multiFaceLandmarks[0][i].y-0.5)*2,0);
        }
    }

outPoints.set(points);
// console.log(r);

});


