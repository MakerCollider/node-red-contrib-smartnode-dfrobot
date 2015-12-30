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
    var gp2y = require("jsupm_gp2y0a");
    function irDistance(config) {
        RED.nodes.createNode(this, config);
        this.analogPin = config.analogPin;
        this.interval = config.interval;
        var node = this;

        node.analogPin = node.analogPin>>>0;
        var GP2Y0A_AREF = 5.0;
        var SAMPLES_PER_QUERY = 20;
        var key = 'P'+node.analogPin;
        if (checkPin.getAnalogPinValue(key)==1){
            node.status({fill: "red", shape: "dot", text: "pin repeat"});
            console.log('IrDistance analog pin ' + node.analogPin +' repeat');
            return;
        }
        else if (checkPin.getAnalogPinValue(key)==0){
            checkPin.setAnalogPinValue(key, 1);
            node.status({fill: "blue", shape: "ring", text: "pin check pass"});
            console.log('IrDistance analog pin ' + node.analogPin +' OK');
        }
        else{
            node.status({fill: "blue", shape: "ring", text: "Unknown"});
            console.log('unknown pin' + node.analogPin + ' key value' + checkPin.getAnalogPinValue(key));
            return;
        }
        var is_on = false;
        var waiting;
        var ird = new gp2y.GP2Y0A(node.analogPin);

        this.on('input', function(msg) {
            //use 'injector' node and pass string to control virtual node
            var payload = msg.payload>>>0;
            console.log("recv msg: " + payload);
            if (payload) {
                //switch on
                if (is_on == false) {
                    is_on = true;
                    waiting = setInterval(readirvalue,node.interval);
                }
            }//switch off
            else {
                if (is_on == true) {
                    is_on = false;
                    node.status({fill: "red", shape: "ring", text: "no signal"});
                    clearInterval(waiting);
                }
            }
        });
        this.on('close', function() {
            clearInterval(waiting);
            checkPin.initAnalogPin();  //init pin 
        });
    	function readirvalue()
    	{
            var value = ird.value(GP2Y0A_AREF, SAMPLES_PER_QUERY);
            node.status({fill: "red", shape: "dot", text: "IR Distance value is " + value});
            console.log("Ir Distance value is " + value);
    		var msg = { payload:value };
    		node.send(msg);
    	}
    }
    RED.nodes.registerType("IrDistance", irDistance);
}
