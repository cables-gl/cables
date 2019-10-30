const date = op.inString("datetime","2010-05-21 13:37:00");
const timestamp = op.outNumber("timestamp");

date.onChange = function() {
  const parsed = Date.parse(date.get());
  timestamp.set(parsed);
}