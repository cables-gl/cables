Op.apply(this, arguments);

this.name='leap finger';

this.patch.loadLib('leap-motion');

var leapFrame=this.addInPort(new Port(this,"leap frame",OP_PORT_TYPE_OBJECT));
leapFrame.ignoreValueSerialize=true;

var handIndex=this.addInPort(new Port(this,"hand index"));
var fingerIndex=this.addInPort(new Port(this,"finger index"));

handIndex.set(0);
fingerIndex.set(0);

var btipX=this.addOutPort(new Port(this,"btip x"));
var btipY=this.addOutPort(new Port(this,"btip y"));
var btipZ=this.addOutPort(new Port(this,"btip z"));


var tipX=this.addOutPort(new Port(this,"tip x"));
var tipY=this.addOutPort(new Port(this,"tip y"));
var tipZ=this.addOutPort(new Port(this,"tip z"));

var pipX=this.addOutPort(new Port(this,"pip x"));
var pipY=this.addOutPort(new Port(this,"pip y"));
var pipZ=this.addOutPort(new Port(this,"pip z"));

var jointX=this.addOutPort(new Port(this,"joint x"));
var jointY=this.addOutPort(new Port(this,"joint y"));
var jointZ=this.addOutPort(new Port(this,"joint z"));

var carpX=this.addOutPort(new Port(this,"carpal x"));
var carpY=this.addOutPort(new Port(this,"carpal y"));
var carpZ=this.addOutPort(new Port(this,"carpal z"));

leapFrame.onValueChange(function()
{
    
    var frame=leapFrame.get();
    if(frame.hands.length>handIndex.get())
    {
        var hand=frame.hands[handIndex.get()];
        
        if(hand.fingers.length>fingerIndex.get())
        {
            var finger=hand.fingers[fingerIndex.get()];
            
            //https://developer.leapmotion.com/documentation/javascript/devguide/Intro_Skeleton_API.html
            
            tipX.set(finger.dipPosition[0]);
            tipY.set(finger.dipPosition[1]);
            tipZ.set(finger.dipPosition[2]);

// if(finger.tipPosition)
{
            btipX.set(finger.tipPosition[0]);
            btipY.set(finger.tipPosition[1]);
            btipZ.set(finger.tipPosition[2]);
    
}

            pipX.set(finger.pipPosition[0]);
            pipY.set(finger.pipPosition[1]);
            pipZ.set(finger.pipPosition[2]);

            jointX.set(finger.mcpPosition[0]);
            jointY.set(finger.mcpPosition[1]);
            jointZ.set(finger.mcpPosition[2]);


            carpX.set(finger.carpPosition[0]);
            carpY.set(finger.carpPosition[1]);
            carpZ.set(finger.carpPosition[2]);
            
            
        }
    }
    
});
