

var exec=op.inTrigger("Exec");

var inData=op.inObject("Kinect Data");
var outPoints=op.outArray("Points");
var outSpline=op.outArray("Spline");

var points=[];
var spline=[];

var joints = {
    SpineBase: 0,
    SpineMid: 1,
    Neck: 2,
    Head: 3,
    ShoulderLeft: 4,
    ElbowLeft: 5,
    WristLeft: 6,
    HandLeft: 7,
    ShoulderRight: 8,
    ElbowRight: 9,
    WristRight: 10,
    HandRight: 11,
    HipLeft: 12,
    KneeLeft: 13,
    AnkleLeft: 14,
    FootLeft: 15,
    HipRight: 16,
    KneeRight: 17,
    AnkleRight: 18,
    FootRight: 19
};


exec.onTriggered=function()
{
    var data=inData.get();
    
    if(data && data.Joints)
    {
        
        for(var i=0;i<data.Joints.length;i++)
        {
            points[i*3+0]=data.Joints[i].Position.x;
            points[i*3+1]=data.Joints[i].Position.y;
            points[i*3+2]=data.Joints[i].Position.z;
        }
        outPoints.set(null);
        outPoints.set(points);

        var count=0;






        spline[count++]=data.Joints[joints.SpineBase].Position.x;
        spline[count++]=data.Joints[joints.SpineBase].Position.y;
        spline[count++]=data.Joints[joints.SpineBase].Position.z;

        spline[count++]=data.Joints[joints.HipLeft].Position.x;
        spline[count++]=data.Joints[joints.HipLeft].Position.y;
        spline[count++]=data.Joints[joints.HipLeft].Position.z;

        spline[count++]=data.Joints[joints.HipLeft].Position.x;
        spline[count++]=data.Joints[joints.HipLeft].Position.y;
        spline[count++]=data.Joints[joints.HipLeft].Position.z;

        spline[count++]=data.Joints[joints.KneeLeft].Position.x;
        spline[count++]=data.Joints[joints.KneeLeft].Position.y;
        spline[count++]=data.Joints[joints.KneeLeft].Position.z;

        spline[count++]=data.Joints[joints.KneeLeft].Position.x;
        spline[count++]=data.Joints[joints.KneeLeft].Position.y;
        spline[count++]=data.Joints[joints.KneeLeft].Position.z;

        spline[count++]=data.Joints[joints.AnkleLeft].Position.x;
        spline[count++]=data.Joints[joints.AnkleLeft].Position.y;
        spline[count++]=data.Joints[joints.AnkleLeft].Position.z;

        spline[count++]=data.Joints[joints.AnkleLeft].Position.x;
        spline[count++]=data.Joints[joints.AnkleLeft].Position.y;
        spline[count++]=data.Joints[joints.AnkleLeft].Position.z;

        spline[count++]=data.Joints[joints.FootLeft].Position.x;
        spline[count++]=data.Joints[joints.FootLeft].Position.y;
        spline[count++]=data.Joints[joints.FootLeft].Position.z;





        spline[count++]=data.Joints[joints.SpineBase].Position.x;
        spline[count++]=data.Joints[joints.SpineBase].Position.y;
        spline[count++]=data.Joints[joints.SpineBase].Position.z;

        spline[count++]=data.Joints[joints.HipRight].Position.x;
        spline[count++]=data.Joints[joints.HipRight].Position.y;
        spline[count++]=data.Joints[joints.HipRight].Position.z;

        spline[count++]=data.Joints[joints.HipRight].Position.x;
        spline[count++]=data.Joints[joints.HipRight].Position.y;
        spline[count++]=data.Joints[joints.HipRight].Position.z;

        spline[count++]=data.Joints[joints.KneeRight].Position.x;
        spline[count++]=data.Joints[joints.KneeRight].Position.y;
        spline[count++]=data.Joints[joints.KneeRight].Position.z;

        spline[count++]=data.Joints[joints.KneeRight].Position.x;
        spline[count++]=data.Joints[joints.KneeRight].Position.y;
        spline[count++]=data.Joints[joints.KneeRight].Position.z;

        spline[count++]=data.Joints[joints.AnkleRight].Position.x;
        spline[count++]=data.Joints[joints.AnkleRight].Position.y;
        spline[count++]=data.Joints[joints.AnkleRight].Position.z;

        spline[count++]=data.Joints[joints.AnkleRight].Position.x;
        spline[count++]=data.Joints[joints.AnkleRight].Position.y;
        spline[count++]=data.Joints[joints.AnkleRight].Position.z;

        spline[count++]=data.Joints[joints.FootRight].Position.x;
        spline[count++]=data.Joints[joints.FootRight].Position.y;
        spline[count++]=data.Joints[joints.FootRight].Position.z;







        
        spline[count++]=data.Joints[joints.SpineBase].Position.x;
        spline[count++]=data.Joints[joints.SpineBase].Position.y;
        spline[count++]=data.Joints[joints.SpineBase].Position.z;

        spline[count++]=data.Joints[joints.SpineMid].Position.x;
        spline[count++]=data.Joints[joints.SpineMid].Position.y;
        spline[count++]=data.Joints[joints.SpineMid].Position.z;


        spline[count++]=data.Joints[joints.SpineMid].Position.x;
        spline[count++]=data.Joints[joints.SpineMid].Position.y;
        spline[count++]=data.Joints[joints.SpineMid].Position.z;

        spline[count++]=data.Joints[joints.Neck].Position.x;
        spline[count++]=data.Joints[joints.Neck].Position.y;
        spline[count++]=data.Joints[joints.Neck].Position.z;


        spline[count++]=data.Joints[joints.Neck].Position.x;
        spline[count++]=data.Joints[joints.Neck].Position.y;
        spline[count++]=data.Joints[joints.Neck].Position.z;

        spline[count++]=data.Joints[joints.Head].Position.x;
        spline[count++]=data.Joints[joints.Head].Position.y;
        spline[count++]=data.Joints[joints.Head].Position.z;



        spline[count++]=data.Joints[joints.Neck].Position.x;
        spline[count++]=data.Joints[joints.Neck].Position.y;
        spline[count++]=data.Joints[joints.Neck].Position.z;


        spline[count++]=data.Joints[joints.ShoulderLeft].Position.x;
        spline[count++]=data.Joints[joints.ShoulderLeft].Position.y;
        spline[count++]=data.Joints[joints.ShoulderLeft].Position.z;


        spline[count++]=data.Joints[joints.ShoulderLeft].Position.x;
        spline[count++]=data.Joints[joints.ShoulderLeft].Position.y;
        spline[count++]=data.Joints[joints.ShoulderLeft].Position.z;

        spline[count++]=data.Joints[joints.ElbowLeft].Position.x;
        spline[count++]=data.Joints[joints.ElbowLeft].Position.y;
        spline[count++]=data.Joints[joints.ElbowLeft].Position.z;

        spline[count++]=data.Joints[joints.ElbowLeft].Position.x;
        spline[count++]=data.Joints[joints.ElbowLeft].Position.y;
        spline[count++]=data.Joints[joints.ElbowLeft].Position.z;

        spline[count++]=data.Joints[joints.WristLeft].Position.x;
        spline[count++]=data.Joints[joints.WristLeft].Position.y;
        spline[count++]=data.Joints[joints.WristLeft].Position.z;

        spline[count++]=data.Joints[joints.WristLeft].Position.x;
        spline[count++]=data.Joints[joints.WristLeft].Position.y;
        spline[count++]=data.Joints[joints.WristLeft].Position.z;

        spline[count++]=data.Joints[joints.HandLeft].Position.x;
        spline[count++]=data.Joints[joints.HandLeft].Position.y;
        spline[count++]=data.Joints[joints.HandLeft].Position.z;





        spline[count++]=data.Joints[joints.Neck].Position.x;
        spline[count++]=data.Joints[joints.Neck].Position.y;
        spline[count++]=data.Joints[joints.Neck].Position.z;

        spline[count++]=data.Joints[joints.ShoulderRight].Position.x;
        spline[count++]=data.Joints[joints.ShoulderRight].Position.y;
        spline[count++]=data.Joints[joints.ShoulderRight].Position.z;

        spline[count++]=data.Joints[joints.ShoulderRight].Position.x;
        spline[count++]=data.Joints[joints.ShoulderRight].Position.y;
        spline[count++]=data.Joints[joints.ShoulderRight].Position.z;

        spline[count++]=data.Joints[joints.ElbowRight].Position.x;
        spline[count++]=data.Joints[joints.ElbowRight].Position.y;
        spline[count++]=data.Joints[joints.ElbowRight].Position.z;

        spline[count++]=data.Joints[joints.ElbowRight].Position.x;
        spline[count++]=data.Joints[joints.ElbowRight].Position.y;
        spline[count++]=data.Joints[joints.ElbowRight].Position.z;

        spline[count++]=data.Joints[joints.WristRight].Position.x;
        spline[count++]=data.Joints[joints.WristRight].Position.y;
        spline[count++]=data.Joints[joints.WristRight].Position.z;

        spline[count++]=data.Joints[joints.WristRight].Position.x;
        spline[count++]=data.Joints[joints.WristRight].Position.y;
        spline[count++]=data.Joints[joints.WristRight].Position.z;

        spline[count++]=data.Joints[joints.HandRight].Position.x;
        spline[count++]=data.Joints[joints.HandRight].Position.y;
        spline[count++]=data.Joints[joints.HandRight].Position.z;




        outSpline.set(null);
        outSpline.set(spline);

  
    }
    
    
    
};