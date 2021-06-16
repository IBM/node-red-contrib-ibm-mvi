// =================================================================
// node-red-contrib-ibm-mvi
//
// Copyright (c) 2021 Takahide Nogayama
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// =================================================================

module.exports = function (RED) {

    // ノードコンストラクタ　https://nodered.jp/docs/creating-nodes/node-js#%E3%83%8E%E3%83%BC%E3%83%89%E3%82%B3%E3%83%B3%E3%82%B9%E3%83%88%E3%83%A9%E3%82%AF%E3%82%BF
    function IterateOverObjectsNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // メッセージ受信 https://nodered.jp/docs/creating-nodes/node-js#%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8%E5%8F%97%E4%BF%A1
        this.on('input', function (msg, send, done) {
            try {
                const targetObjectLabel = config.objectLabel;

                const targetObjects = msg._mvi_res.classified.filter((detected_object) => {
                    return (detected_object.label == targetObjectLabel);
                });

                node.log(`Iterating over detected target objects (length==${targetObjects.length})`);

                if (targetObjects.length >= 1) {
                    msg.parts = {};
                    msg.parts.id = RED.util.generateId();
                    msg.parts.type = "array";
                    msg.parts.len = 1;
                    msg.parts.count = targetObjects.length;

                    targetObjects.forEach(function (targetObject, index) {
                        msg.parts.index = index;
                        msg.payload = targetObject;
                        // send(msg);

                        node.status({ fill: "yellow", shape: "dot", text: `Iterating (${index + 1}/${targetObjects.length})` });

                        // send(RED.util.cloneMessage(msg));
                        send([RED.util.cloneMessage(msg), null]);
                    });

                    node.status({ fill: "green", shape: "dot", text: `Done (${targetObjects.length}/${targetObjects.length})` });
                    setTimeout(function () { node.status({}); }, 10000); // clear status after 10s

                } else {
                    node.status({ fill: "green", shape: "dot", text: `Object==${targetObjectLabel} is not found` });
                    setTimeout(function () { node.status({}); }, 10000); // clear status after 10s

                    send([null, msg]);
                }


            } catch (err) {
                // エラー処理 https://nodered.jp/docs/creating-nodes/node-js#%E3%82%A8%E3%83%A9%E3%83%BC%E5%87%A6%E7%90%86
                // If an error is hit, report it to the runtime
                if (done) {
                    // Node-RED 1.0 compatible
                    done(err);
                } else {
                    // Node-RED 0.x compatible
                    node.error(err, msg);
                }
            }
            if (done) {
                done();
            }
        });
    }
    RED.nodes.registerType("ibm-mvi-iterate-over-objects", IterateOverObjectsNode);
}
