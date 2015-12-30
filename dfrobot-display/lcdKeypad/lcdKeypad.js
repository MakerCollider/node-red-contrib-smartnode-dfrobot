module.exports = function(RED) {

    var jslib = require('jsupm_hd44780');
    var checkPin = require("node-red-contrib-smartnode/extends/check_pin"); 

    function LCDKeypad(config) {
        RED.nodes.createNode(this, config);
        
        console.log("LCDKeypad(HD44780) initalizing.......");

        var TYPE = 0;
        var RS = 8;
        var EN = 9;
        var D4 = 4;
        var D5 = 5;
        var D6 = 6;
        var D7 = 7;

        function compare(val) {
            var key = 'P'+val;
            if (checkPin.getDigitalPinValue(key)==1){
                node.status({fill: "red", shape: "dot", text: "pin repeat"});
                console.log('Pin '+key+ ' occupied, please change other sensor\'s pin config');
                return 0;
            }
            else if (checkPin.getDigitalPinValue(key)==0){
                checkPin.setDigitalPinValue(key, 1);
                node.status({fill: "blue", shape: "ring", text: "pin check pass"});
                console.log('Pin '+key+'OK');
                return 1;
            }
            else{
                node.status({fill: "blue", shape: "ring", text: "Unknown"});
                console.log('unknown pin ' + val + ' key value' + checkPin.getDigitalPinValue(key));
                return 0;
            }
        }
        
        if(!compare(TYPE))
        {
            return;
        }
        if(!compare(RS))
        {
            return;
        }
        if(!compare(EN))
        {
            return;
        }
        if(!compare(D4))
        {
            return;
        }
        if(!compare(D5))
        {
            return;
        }
        if(!compare(D6))
        {
            return;
        }
        if(!compare(D7))
        {
            return;
        }


        var screen = new jslib.HD44780(RS, EN, D4, D5, D6, D7);
        screen.begin(16, 2);
        this.status({fill:"blue",shape:"dot",text:"Initalized"});
        console.log("ScreenB(HD44780) initalized!");

        var lastConsole = "";
        //Handle inputs
        this.on('input', function(msg) {
            if(msg.payload)
            {
                msg.payload = msg.payload.toString();
                screen.clear();
                if(TYPE == 0)
                {
                    if(msg.payload.length > 16)
                    {
                        tmpA = msg.payload.substring(0, 16);
                        tmpB = msg.payload.substring(16);

                        screen.setCursor(0, 0);
                        screen.writeStr(tmpA);
                        screen.setCursor(0, 1);
                        screen.writeStr(tmpB);
                    }
                    else
                        screen.writeStr(msg.payload);
                }
                else
                {
                    screen.setCursor(0, 0);
                    screen.writeStr(">" + lastConsole);
                    screen.setCursor(0, 1);
                    screen.writeStr(">" + msg.payload);
                    lastConsole = msg.payload;
                }
                this.status({fill:"blue",shape:"dot",text:"Showing"});
            }
        });

        this.on('close', function() {
            console.log("Stop Screen");
            screen.clear();
            delete screen; 
            this.status({fill:"red",shape:"ring",text:"closed"});
        });
    }
    RED.nodes.registerType("LCDKeypad", LCDKeypad);
}
