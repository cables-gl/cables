const
    exec=op.inTriggerButton("Update"),
    inEleId=op.inString("Element Id","glcanvas"),
    outPose=op.outObject("Pose"),
    outPoints=op.outArray("Points"),
    outScore=op.outNumber("Score")
    ;

    exec.onTriggered=update;
var flipHorizontal = false;


var imageElement = document.getElementById('glcanvas');

inEleId.onChange=function()
{
    imageElement = document.getElementById(inEleId.get());
};

var psn=null;

posenet.load(
    {
        architecture: 'ResNet50',
        // architecture: 'MobileNetV1',
        flipHorizontal: true,
        decodingMethod: 'multi-person',
        maxDetections: 4,
        outputStride: 16,
        // inputResolution: 513,
        multiplier: 1.0,
        quantBytes: 2
    }).then(function(net) {
        psn=net;
        // console.log(psn);
        const pose = net.estimateSinglePose(imageElement, {
        flipHorizontal: true
  });
  return pose;
}).then(function(pose){
  console.log(pose);
});

var points=[];

function update()
{
    if(!psn || !imageElement)
    {
        outPoints.set(null);
        return;
    }


    imageElement = document.getElementById(inEleId.get());

    if(!imageElement)return;

    const pro=psn.estimateSinglePose(imageElement,
    {
        flipHorizontal: true
    }).then(function(pose)
    {
        points.length=0;

        for(var i=0;i<pose.keypoints.length;i++)
        {
            if(pose.keypoints[i].score>0.5 &&
            pose.keypoints[i].position.x!=0 &&
            pose.keypoints[i].position.y!=0)
            {

                pose.keypoints[i].position.x=pose.keypoints[i].position.x-320;
                pose.keypoints[i].position.y=640-pose.keypoints[i].position.y-400;

                points.push(
                    pose.keypoints[i].position.x,
                    pose.keypoints[i].position.y,
                    0);

            }
        }

        outPose.set(null);
        outPose.set(pose);
        outScore.set(pose.score);

        outPoints.set(null);
        outPoints.set(points);
    });
}





