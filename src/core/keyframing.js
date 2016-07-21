
var CABLES=CABLES || {};
CABLES.TL=CABLES.TL || {};

CABLES.TL.EASING_LINEAR=0;
CABLES.TL.EASING_ABSOLUTE=1;
CABLES.TL.EASING_SMOOTHSTEP=2;
CABLES.TL.EASING_SMOOTHERSTEP=3;
CABLES.TL.EASING_BEZIER=4;

CABLES.TL.EASING_CUBIC_IN=5;
CABLES.TL.EASING_CUBIC_OUT=6;
CABLES.TL.EASING_CUBIC_INOUT=7;

CABLES.TL.EASING_EXPO_IN=8;
CABLES.TL.EASING_EXPO_OUT=9;
CABLES.TL.EASING_EXPO_INOUT=10;

CABLES.TL.EASING_SIN_IN=11;
CABLES.TL.EASING_SIN_OUT=12;
CABLES.TL.EASING_SIN_INOUT=13;

CABLES.TL.Key=function(obj)
{
    this.time=0.0;
    this.value=0.0;
    this.ui={};
    this.onChange=null;
    var easing=0;
    this.bezTime=0.5;
    this.bezValue=0;
    this.bezTimeIn=-0.5;
    this.bezValueIn=0;
    var bezierAnim=null;
    var updateBezier=false;
    var self=this;

    this.setBezierControlOut=function(t,v)
    {
        this.bezTime=t;
        this.bezValue=v;
        updateBezier=true;
        if(this.onChange!==null)this.onChange();
    };

    this.setBezierControlIn=function(t,v)
    {
        this.bezTimeIn=t;
        this.bezValueIn=v;
        updateBezier=true;
        if(this.onChange!==null)this.onChange();
    };

    this.setValue=function(v)
    {
        this.value=v;
        updateBezier=true;
        if(this.onChange!==null)this.onChange();
    };

    this.set=function(obj)
    {
        if(obj)
        {
            if(obj.e) this.setEasing(obj.e);

            if(obj.b)
            {
                this.bezTime=obj.b[0];
                this.bezValue=obj.b[1];
                this.bezTimeIn=obj.b[2];
                this.bezValueIn=obj.b[3];
                updateBezier=true;
            }

            if(obj.hasOwnProperty('t'))this.time=obj.t;
            if(obj.hasOwnProperty('time')) this.time=obj.time;

            if(obj.hasOwnProperty('v')) this.value=obj.v;
                else if(obj.hasOwnProperty('value')) this.value=obj.value;
        }
        if(this.onChange!==null)this.onChange();

    };

    this.getSerialized=function()
    {
        var obj={};
        obj.t=this.time;
        obj.v=this.value;
        obj.e=easing;
        if(easing==CABLES.TL.EASING_BEZIER)
            obj.b=[this.bezTime,this.bezValue,this.bezTimeIn,this.bezValueIn];

        return obj;
    };


    if("isUI" in this)
    {
        // this.initUI();
    }

    function linear(perc,key1,key2)
    {
        return parseFloat(key1.value)+ parseFloat((key2.value - key1.value)) * perc;
    }

    this.easeLinear=function(perc,key2)
    {
        return linear(perc,this,key2);
    };

    this.easeAbsolute=function(perc,key2)
    {
        return this.value;
    };




    this.easeExpoIn=function( t,  key2)
    {
        t= Math.pow( 2, 10 * (t - 1) );
        return linear(t,this,key2);
    };

    this.easeExpoOut=function( t,  key2)
    {
        t= ( -Math.pow( 2, -10 * t ) + 1 );
        return linear(t,this,key2);
    };

    this.easeExpoInOut=function( t,  key2)
    {
        t*=2;
        if (t < 1)
        {
          t= 0.5 * Math.pow( 2, 10 * (t - 1) );
        }
        else
        {
            t--;
            t= 0.5 * ( -Math.pow( 2, -10 * t) + 2 );
        }
        return linear(t,this,key2);
    };

    this.easeSinIn=function( t,key2)
    {
        t= -1 * Math.cos(t * Math.PI/2) + 1;
        return linear(t,this,key2);
    };

    this.easeSinOut=function( t,key2)
    {
        t= Math.sin(t * Math.PI/2);
        return linear(t,this,key2);
    };

    this.easeSinInOut=function( t,key2)
    {
        t= -0.5 * (Math.cos(Math.PI*t) - 1.0);
        return linear(t,this,key2);
    };


    this.easeCubicIn=function(t,key2)
    {
        t=t*t*t;
        return linear(t,this,key2);
    };

    this.easeCubicOut=function(t,key2)
    {
        t--;
        t=(t*t*t + 1) ;
        return linear(t,this,key2);
    };

    this.easeCubicInOut=function(t,key2)
    {
        t*=2;
        if (t < 1) t= 0.5*t*t*t;
        else
        {
            t -= 2;
            t= 0.5*(t*t*t + 2);
        }
        return linear(t,this,key2);
    };



    this.easeSmoothStep=function(perc,key2)
    {
        var x = Math.max(0, Math.min(1, (perc-0)/(1-0)));
        perc= x*x*(3 - 2*x); // smoothstep
        return linear(perc,this,key2);
    };

    this.easeSmootherStep=function(perc,key2)
    {
        var x = Math.max(0, Math.min(1, (perc-0)/(1-0)));
        perc= x*x*x*(x*(x*6 - 15) + 10); // smootherstep
        return linear(perc,this,key2);
    };

    BezierB1=function(t) { return t*t*t; };
    BezierB2=function(t) { return 3*t*t*(1-t); };
    BezierB3=function(t) { return 3*t*(1-t)*(1-t); };
    BezierB4=function(t) { return (1-t)*(1-t)*(1-t); };
    Bezier =function(percent,nextKey)
    {
        var val1x=nextKey.time;
        var val1y=nextKey.value;

        var c1x=nextKey.time+nextKey.bezTimeIn;
        var c1y=nextKey.value-nextKey.bezValueIn;

        var val2x=self.time;
        var val2y=self.value;

        var c2x=self.time+self.bezTime;
        var c2y=self.value-self.bezValue;

        var x = val1x*BezierB1(percent) + c1x*BezierB2(percent) + val2x*BezierB3(percent) + c2x*BezierB4(percent);
        var y = val1y*BezierB1(percent) + c1y*BezierB2(percent) + val2y*BezierB3(percent) + c2y*BezierB4(percent);

        return {x:x,y:y};
    };



    this.easeBezier=function(percent,nextKey)
    {
        if(!bezierAnim)
        {
            bezierAnim=new CABLES.TL.Anim();
            updateBezier=true;
        }

        var timeSpan=nextKey.time-self.time;
        if(updateBezier)
        {
            bezierAnim.clear();

            var steps=20;
            var is=1/steps;

            for(var i=0;i<steps;i++)
            {
                var v=Bezier(i*is,nextKey);

                var time=self.time+timeSpan/steps*i;

                bezierAnim.setValue(v.x,v.y);

                // console.log('key ',time,v.y);
            }
            updateBezier=false;
        }

        return bezierAnim.getValue(self.time+percent*timeSpan);
    };

    this.getEasing=function()
    {
        return easing;
    };

    this.setEasing=function(e)
    {
        easing=e;

        if(easing==CABLES.TL.EASING_ABSOLUTE) this.ease=this.easeAbsolute;
        else if(easing==CABLES.TL.EASING_SMOOTHSTEP) this.ease=this.easeSmoothStep;
        else if(easing==CABLES.TL.EASING_SMOOTHERSTEP) this.ease=this.easeSmootherStep;

        else if(easing==CABLES.TL.EASING_CUBIC_IN) this.ease=this.easeCubicIn;
        else if(easing==CABLES.TL.EASING_CUBIC_OUT) this.ease=this.easeCubicOut;
        else if(easing==CABLES.TL.EASING_CUBIC_INOUT) this.ease=this.easeCubicInOut;

        else if(easing==CABLES.TL.EASING_EXPO_IN) this.ease=this.easeExpoIn;
        else if(easing==CABLES.TL.EASING_EXPO_OUT) this.ease=this.easeExpoOut;
        else if(easing==CABLES.TL.EASING_EXPO_INOUT) this.ease=this.easeExpoInOut;

        else if(easing==CABLES.TL.EASING_SIN_IN) this.ease=this.easeSinIn;
        else if(easing==CABLES.TL.EASING_SIN_OUT) this.ease=this.easeSinOut;
        else if(easing==CABLES.TL.EASING_SIN_INOUT) this.ease=this.easeSinInOut;

        else if(easing==CABLES.TL.EASING_BEZIER)
        {
            updateBezier=true;
            this.ease=this.easeBezier;
        }
        else
        {
            easing=CABLES.TL.EASING_LINEAR;
            this.ease=this.easeLinear;
        }
    };

    this.setEasing(CABLES.TL.EASING_LINEAR);
    this.set(obj);

};

CABLES.TL.Anim=function(cfg)
{
    this.keys=[];
    var timesLooped=0;
    this.onChange=null;
    this.stayInTimeline=false;
    this.loop=false;
    this.defaultEasing=CABLES.TL.EASING_LINEAR;
    var needsSort=false;
    this.onLooped=null;

    this.hasEnded=function(time)
    {
        if(this.keys.length==0)return true;
        if(this.keys[this.keys.length-1].time<=time)return true;
        return false;
    };

    this.clear=function(time)
    {
        var v=0;
        if(time)
            v=this.getValue(time);
        this.keys.length=0;

        if(time)
            this.setValue(time,v);
    };

    this.sortKeys=function()
    {

        this.keys.sort(function(a, b)
        {
            return parseFloat(a.time) - parseFloat(b.time);
        });
        needsSort=false;
    };

    this.getLength=function()
    {
        if(this.keys.length===0)return 0;
        return this.keys[this.keys.length-1].time;
    };

    this.getKeyIndex=function(time)
    {
        var index=0;
        for(var i=0;i<this.keys.length;i++)
        {
            if(time >= this.keys[i].time) index=i;
            if( this.keys[i].time > time ) return index;
        }
        return index;
    };
    this.setValue=function(time,value)
    {
        var found=false;
        for(var i in this.keys)
        {
            if(this.keys[i].time==time)
            {
                found=this.keys[i];
                this.keys[i].setValue(value);
                break;
            }
        }

        if(!found)
        {
            // console.log('not found');

            this.keys.push(new CABLES.TL.Key({time:time,value:value,e:this.defaultEasing})) ;
        }

        if(this.onChange)this.onChange();
        needsSort=true;
    };


    this.getSerialized=function()
    {
        var obj={};
        obj.keys=[];
        obj.loop=this.loop;

        for(var i in this.keys)
        {
            obj.keys.push( this.keys[i].getSerialized() );
        }

        return obj;
    };


    this.getKey=function(time)
    {
        var index=this.getKeyIndex(time);
        return this.keys[index];
    };

    this.getNextKey=function(time)
    {
        var index=this.getKeyIndex(time)+1;
        if(index>=this.keys.length)index=this.keys.length-1;

        return this.keys[index];
    };

    this.isFinished=function(time)
    {
        if(this.keys.length<=0)return true;
        return time>this.keys[this.keys.length-1].time;
    };

    this.getValue=function(time)
    {
        if(this.keys.length===0)return 0;
        if(needsSort)this.sortKeys();

        if(time<this.keys[0].time)return this.keys[0].value;

        if(this.loop && time>this.keys[this.keys.length-1].time)
        {
            var currentLoop=time/this.keys[this.keys.length-1].time;
            if(currentLoop>timesLooped)
            {
                timesLooped++;
                if(this.onLooped)this.onLooped();
            }
            time=(time-this.keys[0].time)%(this.keys[this.keys.length-1].time-this.keys[0].time);
            time+=this.keys[0].time;
        }

        var index=this.getKeyIndex(time);
        if(index>=this.keys.length-1)
        {
            return this.keys[this.keys.length-1].value;
        }
        var index2=parseInt(index,10)+1;
        var key1=this.keys[index];
        var key2=this.keys[index2];

        if(!key2)return -1;

        var perc=(time-key1.time)/(key2.time-key1.time);
        return key1.ease(perc,key2);
    };



    this.addKey=function(k)
    {
        if(k.time===undefined)
        {
            console.log('key time undefined, ignoring!');
        }
        else
        {
            this.keys.push(k);
        }
    };
};

CABLES.TL.Anim.slerpQuaternion=function(time,q,animx,animy,animz,animw)
{
    var i1=animx.getKeyIndex(time);
    var i2=parseInt(animx.getKeyIndex(time))+1;
    if(i2>=animx.keys.length)i2=animx.keys.length-1;

    if(i1==i2)
    {
        quat.set(q,
            animx.keys[i1].value,
            animy.keys[i1].value,
            animz.keys[i1].value,
            animw.keys[i1].value
        );
    }
    else
    {
        var key1Time=animx.keys[i1].time;
        var key2Time=animx.keys[i2].time;
        var perc=(time-key1Time)/(key2Time-key1Time);

        quat.set(CABLES.TL.Anim.slerpQuaternion.q1,
            animx.keys[i1].value,
            animy.keys[i1].value,
            animz.keys[i1].value,
            animw.keys[i1].value
        );

        quat.set(CABLES.TL.Anim.slerpQuaternion.q2,
            animx.keys[i2].value,
            animy.keys[i2].value,
            animz.keys[i2].value,
            animw.keys[i2].value
        );

        quat.slerp(q, CABLES.TL.Anim.slerpQuaternion.q1, CABLES.TL.Anim.slerpQuaternion.q2, perc);
    }
    return q;
};

CABLES.TL.Anim.slerpQuaternion.q1=quat.create();
CABLES.TL.Anim.slerpQuaternion.q2=quat.create();
