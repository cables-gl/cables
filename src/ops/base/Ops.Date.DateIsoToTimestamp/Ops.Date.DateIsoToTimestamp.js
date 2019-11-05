const date = op.inString("datetime");
const timestamp = op.outNumber("timestamp");

date.onChange = function() {
  const parsed = Date.parse(date.get());
  timestamp.set(parsed);
}