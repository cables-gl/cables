To get OSC data into cables you will need to install Osc2ws (Osc to web socket) from the following repo

https://github.com/pandrr/osc2ws

After following the instructions make sure that you check the example file to see how the web socket op is set up to receieve OSC data.

The websocket op receives data from osc2ws on port 8000
make sure that your OSC device is transmitting on port 9000 and that it has the same IP address as your computer.