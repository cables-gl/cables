This op is able to output the index and value of a midi NRPN signal.

In contrast to Note and CC signals, a midi NRPN message's value ranges from 0 to 16383 instead of 0 to 127. This makes NRPN signals more useful for fine-grained control of visual data. 

Please refer to http://www.philrees.co.uk/nrpnq.htm as a starting point if you want to know more about it in-depth. 

You can press "learn" and then send a NRPN signal from your DAW to automatically assign them to MidiNRPN.

It is possible to normalize the NRPN values (which usually range from 0-16383) to either "0 to 1" or "-1 to 1“.