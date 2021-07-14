// =================================================================
// node-red-contrib-ibm-mvi
//
// Copyright (c) 2021 International Business Machines
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// =================================================================

module.exports = function (RED) {

    // ノードコンストラクタ　https://nodered.jp/docs/creating-nodes/node-js#%E3%83%8E%E3%83%BC%E3%83%89%E3%82%B3%E3%83%B3%E3%82%B9%E3%83%88%E3%83%A9%E3%82%AF%E3%82%BF
    function ServerInferNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        // const mviUriToInfer = config.mviUriToInfer;

        // メッセージ受信 https://nodered.jp/docs/creating-nodes/node-js#%E3%83%A1%E3%83%83%E3%82%BB%E3%83%BC%E3%82%B8%E5%8F%97%E4%BF%A1
        this.on('input', function (msg, send, done) {
            try {

                if (!config.mviUriToInfer) {
                    throw "URI is not found"
                }

                const IbmMvi = require('ibm-mvi');

                node.status({ fill: "yellow", shape: "dot", text: "Calling API ..." });

                IbmMvi.post_multipart_form_data(node, msg, send, done, config.mviUriToInfer, function () {
                    // console.log(msg._mvi_res_raw);
                    jsonobj = JSON.parse(msg._mvi_res_raw)

                    node.log(JSON.stringify(jsonobj, null, 4));

                    msg.payload = jsonobj;
                    msg._mvi_res = jsonobj;

                    node.status({ fill: "green", shape: "dot", text: "Done" });
                    setTimeout(function () { node.status({}); }, 10000); // clear status after 10s

                    send(msg);
                    done();
                });

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
                if (done) {
                    done();
                }
            }


            // const FormData = require('form-data');
            // const fs = require('fs');
            // const tmp = require('tmp');

            // tmp.file(function _tempFileCreated(tempfileErr, tempfilePath, tempfileFd, tempfileCleanupCallback) {
            //     if (tempfileErr) throw tempfileErr;

            //     console.log('File: ', tempfilePath);

            //     fs.writeFileSync(tempfilePath, msg.req.files[0].buffer);

            //     const form = new FormData();
            //     form.append('files', fs.createReadStream(tempfilePath));

            //     form.submit(config.mviUriToInfer, function(err, res) {
            //         if(err){
            //             if(err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT') {
            //                 node.error(RED._("common.notification.errors.no-response"), msg);
            //                 node.status({fill:"red", shape:"ring", text:"common.notification.errors.no-response"});
            //             }else{
            //                 node.error(err,msg);
            //                 node.status({fill:"red", shape:"ring", text:err.code});
            //             }
            //             msg.payload = err.toString() + " : " + url;
            //             msg.statusCode = err.code;
            //             send(msg);
            //             done();
            //         }else{
            //             console.log(res.statusCode);

            //             var body = "";
            //             res.on('data', function(chunk) {
            //                 body += chunk;
            //             });
            //             res.on('end', function() {
            //                 // console.log(body);
            //                 jsonobj = JSON.parse(body)
            //                 tempfileCleanupCallback(); // clean up tempfile

            //                 console.log(JSON.stringify(jsonobj, null, 4));


            //                 msg.payload = jsonobj;
            //                 send(msg);
            //                 done();
            //             });
            //         }
            //     }); 
            // });
        });
    }
    RED.nodes.registerType("ibm-mvi-server-infer", ServerInferNode);
}
