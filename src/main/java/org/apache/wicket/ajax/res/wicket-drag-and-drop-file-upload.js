;(function (undefined) {

    'use strict';

    if (typeof(Wicket) === 'undefined' || typeof(Wicket.Ajax) === 'undefined') {
        throw "Wicket.DragAndDropFileUpload needs wicket-ajax.js as prerequisite.";
    }

    if (Wicket.Ajax.DragAndDropFileUpload) {
        return;
    }

    Wicket.Ajax.DragAndDropFileUpload = function (attrs) {
        // f - form id, u - upload url, dropArea - drop areaId
        var dropAreaId = attrs['dropArea'];
        var fileUploadComponentId = attrs['c'];
        var dropArea = document.getElementById(dropAreaId);
        var fileUpload = document.getElementById(fileUploadComponentId);
        if (!((('draggable' in dropArea) || ('ondragstart' in c && 'ondrop' in dropArea)) && 'FormData' in window && 'FileReader' in window && 'classList' in dropArea)) {
            Wicket.Log.error("WicketFileDragAndDropBehaviour is not supported by this browser");
            return
        }

        dropArea.classList.add("wicket-file-drag-and-drop--supported");

        function dropHandler(ev) {
            ev.preventDefault();
            Wicket.Log.info("DragAndDropFileUpload drop " + dropAreaId);
            var dt = ev.dataTransfer;
            var formData = new FormData();
            var files = [];
            var i;
            if (dt.items) {
                // DataTransferItemList
                for (i = 0; i < dt.items.length; i++) {
                    if (dt.items[i].kind == "file") {
                        var f = dt.items[i].getAsFile();
                        Wicket.Log.info("... file[" + i + "].name = " + f.name);
                        files.push(f);
                        // formData.append(attrs['c']+"[]", f);
                    }
                }
            } else {
                // DataTransfer
                for (i = 0; i < dt.files.length; i++) {
                    Wicket.Log.info("... file[" + i + "].name = " + dt.files[i].name);
                    files.push(dt.files[i]);
                    // formData.append(attrs['c']+"[]", dt.files[i]);
                }
            }

            if (files.length > 0) {
                // formData.append(attrs['f']+"_hf_0","");
                files.forEach(function (f) {
                    formData.append(fileUpload.getAttribute("name"), f)
                });

                // Wicket.Ajax.ajax will simply submit a multipart form into the iframe, which we don't want
                var xhr = new XMLHttpRequest();
                xhr.open('POST', attrs['u'] + "&wicket-ajax=true&wicket-ajax-baseurl=" + Wicket.Form.encode(Wicket.Ajax.baseUrl || '.'), true);
                xhr.send(formData);
                xhr.addEventListener("load", function() {console.log(arguments)})
                // Wicket.Ajax.ajax({
                //     u: attrs.u,
                //     m: 'POST',
                //     mp: true,
                //     npd: formData
                // });

            } else {
                Wicket.Log.error("No files to upload " + dropAreaId);
            }
        }

        function changeHandler(ev) {
            ev.preventDefault();
            Wicket.Log.info("DragAndDropFileUpload change " + dropAreaId);
        }

        function dragOverHandler(ev) {
            ev.preventDefault();
            Wicket.Log.info("DragAndDropFileUpload dragover " + dropAreaId);
        }

        function dragEnterHandler(ev) {
            ev.preventDefault();
            Wicket.Log.info("DragAndDropFileUpload dragenter " + dropAreaId);
            dropArea.classList.remove("wicket-file-drag-and-drop--drag-over")
        }

        function dragEndHandler(ev) {
            Wicket.Log.info("DragAndDropFileUpload dragend " + dropAreaId);
            dropArea.classList.remove("wicket-file-drag-and-drop--drag-over");
            var dt = ev.dataTransfer;
            if (dt.items) {
                // Use DataTransferItemList interface to remove the drag data
                // for (var i = 0; i < dt.items.length; i++) {
                //     dt.items.remove(i); // explodes
                // }
                dt.items.clear();
            } else {
                // Use DataTransfer interface to remove the drag data
                dt.clearData();
            }
        }

        dropArea.addEventListener("drop", dropHandler);
        dropArea.addEventListener("dragover", dragOverHandler);
        dropArea.addEventListener("dragenter", dragEnterHandler);
        dropArea.addEventListener("dragleave", dragEndHandler);
        dropArea.addEventListener("dragend", dragEndHandler);

        // This block contains copy-paste from Wicket 8 wicket-ajax-jquery.js
        {
            var createIFrame,
                getAjaxBaseUrl,
                isUndef,
                replaceAll,
                htmlToDomDocument,
                nodeListToArray;

            isUndef = function (target) {
                return (typeof(target) === 'undefined' || target === null);
            };

            replaceAll = function (str, from, to) {
                var regex = new RegExp(from.replace( /\W/g ,'\\$&' ), 'g');
                return str.replace(regex,to);
            };

            /**
             * Creates an iframe that can be used to load data asynchronously or as a
             * target for Ajax form submit.
             *
             * @param iframeName {String} the value of the iframe's name attribute
             */
            createIFrame = function (iframeName) {
                // WICKET-6340 properly close tag for XHTML markup
                var $iframe = jQuery('<iframe name="'+iframeName+'" id="'+iframeName+
                    '" src="about:blank" style="position: absolute; top: -9999px; left: -9999px;"></iframe>');
                return $iframe[0];
            };

            /**
             * A safe getter for Wicket's Ajax base URL.
             * If the value is not defined or is empty string then
             * return '.' (current folder) as base URL.
             * Used for request header and parameter
             */
            getAjaxBaseUrl = function () {
                var baseUrl = Wicket.Ajax.baseUrl || '.';
                return baseUrl;
            };

            /**
             * Helper method that serializes HtmlDocument to string and then
             * creates a DOMDocument by parsing this string.
             * It is used as a workaround for the problem described at https://issues.apache.org/jira/browse/WICKET-4332
             * @param htmlDocument (DispHtmlDocument) the document object created by IE from the XML response in the iframe
             */
            htmlToDomDocument = function (htmlDocument) {
                var xmlAsString = htmlDocument.body.outerText;
                xmlAsString = xmlAsString.replace(/^\s+|\s+$/g, ''); // trim
                xmlAsString = xmlAsString.replace(/(\n|\r)-*/g, ''); // remove '\r\n-'. The dash is optional.
                var xmldoc = Wicket.Xml.parse(xmlAsString);
                return xmldoc;
            };

            /**
             * Converts a NodeList to an Array
             *
             * @param nodeList The NodeList to convert
             * @returns {Array} The array with document nodes
             */
            nodeListToArray = function (nodeList) {
                var arr = [],
                    nodeId;
                if (nodeList && nodeList.length) {
                    for (nodeId = 0; nodeId < nodeList.length; nodeId++) {
                        arr.push(nodeList.item(nodeId));
                    }
                }
                return arr;
            };

            /**
             * Functions executer takes array of functions and executes them.
             * The functions are executed one by one as far as the return value is FunctionsExecuter.DONE.
             * If the return value is FunctionsExecuter.ASYNC or undefined then the execution of
             * the functions will be resumed once the `notify` callback function is called.
             * This is needed because header contributions need to do asynchronous download of JS and/or CSS
             * and they have to let next function to run only after the download.
             * After the FunctionsExecuter is initialized, the start methods triggers the first function.
             *
             * @param functions {Array} - an array of functions to execute
             */
            var FunctionsExecuter = function (functions) {

                this.functions = functions;

                /**
                 * The index of the currently executed function
                 * @type {number}
                 */
                this.current = 0;

                /**
                 * Tracks the depth of the call stack when `notify` is used for
                 * asynchronous notification that a function execution has finished.
                 * Should be reset to 0 when at some point to avoid problems like
                 * "too much recursion". The reset may break the atomicity by allowing
                 * another instance of FunctionExecuter to run its functions
                 * @type {number}
                 */
                this.depth = 0; // we need to limit call stack depth

                this.processNext = function () {
                    if (this.current < this.functions.length) {
                        var f, run;

                        f = this.functions[this.current];
                        run = function () {
                            try {
                                var n = jQuery.proxy(this.notify, this);
                                return f(n);
                            }
                            catch (e) {
                                Wicket.Log.error("FunctionsExecuter.processNext: " + e);
                                return FunctionsExecuter.FAIL;
                            }
                        };
                        run = jQuery.proxy(run, this);
                        this.current++;

                        if (this.depth > FunctionsExecuter.DEPTH_LIMIT) {
                            // to prevent stack overflow (see WICKET-4675)
                            this.depth = 0;
                            window.setTimeout(run, 1);
                        } else {
                            var retValue = run();
                            if (isUndef(retValue) || retValue === FunctionsExecuter.ASYNC) {
                                this.depth++;
                            }
                            return retValue;
                        }
                    }
                };

                this.start = function () {
                    var retValue = FunctionsExecuter.DONE;
                    while (retValue === FunctionsExecuter.DONE) {
                        retValue = this.processNext();
                    }
                };

                this.notify = function () {
                    this.start();
                };
            };

            /**
             * Response that should be used by a function when it finishes successfully
             * in synchronous manner
             * @type {number}
             */
            FunctionsExecuter.DONE = 1;

            /**
             * Response that should be used by a function when it finishes abnormally
             * in synchronous manner
             * @type {number}
             */
            FunctionsExecuter.FAIL = 2;

            /**
             * Response that may be used by a function when it executes asynchronous
             * code and must wait `notify()` to be executed.
             * @type {number}
             */
            FunctionsExecuter.ASYNC = 3;

            /**
             * An artificial number used as a limit of the call stack depth to avoid
             * problems like "too much recursion" in the browser.
             * The depth is not easy to be calculated because the memory used by the
             * stack depends on many factors
             * @type {number}
             */
            FunctionsExecuter.DEPTH_LIMIT = 1000;
        }

    };
})();

