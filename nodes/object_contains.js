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
    function ObjectContainsNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // メッセージ受信 https://nodered.jp/docs/creating-nodes/node-js#%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8%E5%8F%97%E4%BF%A1
        this.on('input', function (msg, send, done) {

            try {
                const IbmMvi = require('ibm-mvi');

                const overlapThreshold = 0.5;
                const detectedObjects = msg._mvi_res.classified;

                const subject = msg.payload;
                const objectLabel = config.objectLabel;

                const subjectContainsObject = IbmMvi.subject_contains_one_or_more_objects(subject, objectLabel, detectedObjects, overlapThreshold);

                if (subjectContainsObject) {
                    node.log(`${msg.payload.label} contains ${objectLabel}`);
                } else {
                    node.log(`${msg.payload.label} does not contain ${objectLabel}`);
                }

                if (!config.negation) {
                    if (subjectContainsObject) {
                        node.status({ fill: "green", shape: "dot", text: `${msg.payload.label} contains ${objectLabel}` });
                        send([msg, null]);
                    } else {
                        node.status({ fill: "red", shape: "dot", text: `${msg.payload.label} does not contain ${objectLabel}` });
                        send([null, msg]);
                    }
                } else {
                    if (subjectContainsObject) {
                        node.status({ fill: "red", shape: "dot", text: `${msg.payload.label} contains ${objectLabel}` });
                        send([null, msg]);
                    } else {
                        node.status({ fill: "green", shape: "dot", text: `${msg.payload.label} does not contain ${objectLabel}` });
                        send([msg, null]);
                    }
                }

                setTimeout(function () { node.status({}); }, 10000); // clear status after 10s

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
    RED.nodes.registerType("ibm-mvi-object-contains", ObjectContainsNode);
}
