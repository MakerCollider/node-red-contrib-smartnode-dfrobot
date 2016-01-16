
/**
 * Copyright 2015, 2015 MakerCollider.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
module.exports = function(RED){ 
    var checkPin = require("node-red-contrib-smartnode/extends/check_pin");
    var upmRBGLed = require("jsupm_rgbled");
    function RGBLed(config) {
        RED.nodes.createNode(this, config);
        this.pwmRedPin = config.pwmRedPin;
        this.pwmGreenPin = config.pwmGreenPin;
        this.pwmBluePin = config.pwmBluePin;
        var node = this;
        node.pwmRedPin = node.pwmRedPin>>>0;
        node.pwmGreenPin = node.pwmGreenPin>>>0;
        node.pwmBluePin = node.pwmBluePin>>>0;

        var redKey = 'P'+node.pwmRedPin;
        var greenKey = 'P'+node.pwmGreenPin;
        var blueKey = 'P'+node.pwmBluePin;
        if ((checkPin.getDigitalPinValue(redKey)==1) || (checkPin.getDigitalPinValue(greenKey)==1) || (checkPin.getDigitalPinValue(blueKey)==1)){
            node.status({fill: "red", shape: "dot", text: "pin repeat"});
            console.log('red pwm pin ' + node.pwmRedPin +' repeat');
            console.log('green pwm pin ' + node.pwmGreenPin +' repeat');
            console.log('blue pwm pin ' + node.pwmBluePin +' repeat');
            return;
        }
        else if ((checkPin.getDigitalPinValue(redKey)==0) && (checkPin.getDigitalPinValue(greenKey)==0) && (checkPin.getDigitalPinValue(blueKey)==0)){
            checkPin.setDigitalPinValue(redKey, 1);
            checkPin.setDigitalPinValue(greenKey, 1);
            checkPin.setDigitalPinValue(blueKey, 1);
            node.status({fill: "blue", shape: "ring", text: "pin check pass"});
            console.log('red pwm pin ' + node.pwmRedPin +' OK');
            console.log('green pwm pin ' + node.pwmGreenPin +' OK');
            console.log('blue pwm pin ' + node.pwmBluePin +' OK');
        }
        else{
            node.status({fill: "blue", shape: "ring", text: "Unknown"});
            console.log('unknown pin' + node.pwmRedPin + ' key value' + checkPin.getDigitalPinValue(redKey));
            console.log('unknown pin' + node.pwmGreenPin + ' key value' + checkPin.getDigitalPinValue(greenKey));
            console.log('unknown pin' + node.pwmBluePin + ' key value' + checkPin.getDigitalPinValue(blueKey));
            return;
        }

        if((node.pwmRedPin == node.pwmGreenPin) || (node.pwmRedPin == node.pwmBluePin) || (node.pwmGreenPin == node.pwmBluePin)){
            console.log("conflict in pins");
            return;
        }

        var myRGBLed = new upmRBGLed.RGBLED(node.pwmRedPin, node.pwmGreenPin, node.pwmBluePin);
        this.on('input',function(msg) {
            // console.log("msg:" + msg.color);
            if (msg.color){
                myRGBLed.colorRGB(msg.color.red, msg.color.green, msg.color.blue);
                node.status({fill: "blue", shape: "dot", text: "red: " +msg.color.red +" green: "
                    + msg.color.green+" blue:" + msg.color.blue});
            }
        });
        this.on('close', function() {
            checkPin.initDigitalPin();  //init pin
        });
    }
    RED.nodes.registerType("RGBLed", RGBLed);
}
