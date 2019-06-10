const eventIn = op.inObject('MIDI Event In');
const timingIn = op.inValueSelect('Timing', ['straight', 'dotted', 'triplet'], 'straight');
const eventOut = op.outObject('MIDI Event Out');
const beatOut = op.outTrigger('Tick Out');
const clockStartOut = op.outTrigger('Clock Start');
const clockStopOut = op.outTrigger('Clock Stop');
const clockContinueOut = op.outTrigger('Clock Continue');

var outBPM = op.outValue('BPM');
var outBeatDuration = op.outValue('Tick Duration');
var outSubTick = op.outValue('Sub Tick');

const fullNoteOut = op.outTrigger('1/1');
const halfNoteOut = op.outTrigger('1/2');
const quarterNoteOut = op.outTrigger('1/4');
const eigthNoteOut = op.outTrigger('1/8');
const sixteenthNoteOut = op.outTrigger('1/16');

const outs = {
  full: fullNoteOut,
  half: halfNoteOut,
  quarter: quarterNoteOut,
  eigth: eigthNoteOut,
  sixteenth: sixteenthNoteOut,
};

// var triggerTick=op.outTrigger("Beat");

// var triggerStart=op.outTrigger("Start");

// var triggerSub=op.outTrigger("Sub Beat");

const CLOCK = 0xf8;
const CLOCK_START = 0xfa;
const CLOCK_CONTINUE = 0xfb;
const CLOCK_STOP = 0xfc;

const STRAIGHT_TICKS = {
  full: 96,
  half: 48,
  quarter: 24,
  eigth: 12,
  sixteenth: 6,
};

const TICKS = Object.keys(STRAIGHT_TICKS).reduce(
  (acc, val) => {
    acc.straight = STRAIGHT_TICKS;
    acc.dotted = { ...acc.dotted, [val]: STRAIGHT_TICKS[val] + STRAIGHT_TICKS[val] / 2 };
    acc.triplet = { ...acc.triplet, [val]: (STRAIGHT_TICKS[val] * 2) / 3 };
    return acc;
  },
  { straight: {}, dotted: {}, triplet: {} },
);

var tickCount = 0;

var lastBeat = 0;
// var beatCountStart=0;

eventIn.onChange = () => {
  const event = eventIn.get();
  if (!event) return;

  const [statusByte, , ] = event.data;
  if (statusByte === CLOCK_START) {
    tickCount = 0;
    clockStartOut.trigger();
  } else if (statusByte === CLOCK_STOP) {
    clockStopOut.trigger();
  } else if (statusByte === CLOCK || statusByte === CLOCK_CONTINUE) {
    if (statusByte === CLOCK_CONTINUE) clockContinueOut.trigger();

    const {
      full, half, quarter, eigth, sixteenth,
    } = TICKS[timingIn.get()];
    if (tickCount % 24 === 0) {
      if (lastBeat !== 0) {
        const diff = CABLES.now() - lastBeat;
        const bpm = 60000 / diff;
        outBPM.set(bpm);
        outBeatDuration.set(15 / bpm);
      }

      lastBeat = CABLES.now();
    }
    if (tickCount % full === 0) outs.full.trigger();
    if (tickCount % half === 0) outs.half.trigger();
    if (tickCount % quarter === 0) outs.quarter.trigger();
    if (tickCount % eigth === 0) outs.eigth.trigger();
    if (tickCount % sixteenth === 0) outs.sixteenth.trigger();
    beatOut.trigger();
    tickCount += 1;
    outSubTick.set(tickCount % 24);
  }

  eventOut.set(event);
};
/*
eventIn.onChange=function()
{
    if(!eventIn.get())return;


    var data=eventIn.get().data;

    // var data = _event.data;
    var isTick = data[0] == clockTick;
    var isStart = data[0] == clockStart;

    if (isStart)
    {
        tickCount = 0;
        triggerStart.trigger();
    }

    else if (isTick)
    {

        if (tickCount==0)
        {
            if(lastBeat!=0)
            {
                var diff=CABLES.now()-lastBeat;
                var bpm=60*1000/diff;
                outBPM.set(bpm);
                outBeatDuration.set(60/bpm/4);
            }

            lastBeat=CABLES.now();
            triggerTick.trigger();
        }
        if (tickCount%6==0 )triggerSub.trigger();

        tickCount++;

        if (tickCount%24 == 0) tickCount = 0;
    }

    outSubTick.set(tickCount);
};
*/
