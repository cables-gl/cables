const
    inPose=op.inObject("Pose"),
    inPart=op.inDropDown("Part",["nose","leftEye","rightEye","leftEar","rightEar","leftShoulder","rightShoulder","leftElbow","rightElbow","leftWrist","rightWrist","leftHip","rightHip","leftKnee","rightKnee","leftAnkle","rightAnkle"]),
    outPose=op.outObject("Pose Out"),
    outX=op.outNumber("X"),
    outY=op.outNumber("Y"),
    outScore=op.outNumber("Score")
    ;

inPose.onChange=update;

inPart.onChange=function()
{
    op.setUiAttrib({"extendTitle":inPart.get()});
};

function update()
{
    const pose=inPose.get();


    if(!pose || !pose.keypoints)
    {
        return;
    }

    outPose.set(pose);


    const partName=inPart.get();

    for(var i=0;i<pose.keypoints.length;i++)
    {
        if(pose.keypoints[i].part==partName)
        {
            outX.set(pose.keypoints[i].position.x);
            outY.set(pose.keypoints[i].position.y);
            outScore.set(pose.keypoints[i].score);
        }
    }

}