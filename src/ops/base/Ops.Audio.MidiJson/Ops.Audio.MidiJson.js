var inObj=op.inObject("MidiJson");
var inTime=op.inValue("Time");

var outNumTracks=op.outValue("Num Tracks");
var outNames=op.outArray("Names");
var outProgress=op.outArray("Progress");
var outVelocity=op.outArray("Velocity");

var midi=null;
var arrNames=[];
var arrProgress=[];
var arrVelocity=[];

inObj.onChange=function()
{
    midi=null;
    outNumTracks.set(0);
    
    midi=inObj.get();
    if(!midi)return;
    if(!midi.tracks)return;
    
    outNumTracks.set(midi.tracks.length);
    
    arrNames.length=midi.tracks.length;

    for(var t=0;t<midi.tracks.length;t++)
    {
        for(var n=0;n<midi.tracks[t].notes.length;n++)
        {
            var note=midi.tracks[t].notes[n];
            note.timeEnd=note.time+note.duration;
        }
    }

};



inTime.onChange=function()
{
    if(!midi)return;
    if(!midi.tracks)return;
    
    var time=inTime.get();
    outNames.set(null);
    outProgress.set(null);
    outVelocity.set(null);

    for(var t=0;t<midi.tracks.length;t++)
    {
        arrNames[t]='';
        arrProgress[t]=0;
        arrVelocity[t]=0;
        
        for(var n=0;n<midi.tracks[t].notes.length;n++)
        {
            var note=midi.tracks[t].notes[n];

            if(
                time>note.time && 
                time<note.timeEnd)
            {
                arrProgress[t]=(time-note.time)/(note.duration);
                arrNames[t]=note.name;
                arrVelocity[t]=note.velocity;
            }
        }
    }
    
    outNames.set(arrNames);
    outProgress.set(arrProgress);
    outVelocity.set(arrVelocity);
    
};