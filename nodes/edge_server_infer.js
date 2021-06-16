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
    function EdgeServerInferNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        // const mviUriToInfer = config.mviUriToInfer;

        // メッセージ受信 https://nodered.jp/docs/creating-nodes/node-js#%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8%E5%8F%97%E4%BF%A1
        this.on('input', function (msg, send, done) {
            const IbmMvi = require('ibm-mvi');

            IbmMvi.post_multipart_form_data(msg, send, done, config.mviUriToInfer, function () {
                console.log(msg._body);
                jsonobj = JSON.parse(msg._body)

                node.log(JSON.stringify(jsonobj, null, 4));

                msg.payload = jsonobj;
                send(msg);
                done();
            });

        });
    }
    RED.nodes.registerType("ibm-mvi-edge-server-infer", EdgeServerInferNode);
}
