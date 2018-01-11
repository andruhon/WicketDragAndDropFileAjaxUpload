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

            /**
             * Handles execution of Ajax calls.
             *
             * @param {Object} attrs - the Ajax request attributes configured at the server side
             */
            Wicket.Ajax.Call.prototype.doAjax = function (attrs) {

                var
                    // the headers to use for each Ajax request
                    headers = {
                        'Wicket-Ajax': 'true',
                        'Wicket-Ajax-BaseURL': getAjaxBaseUrl()
                    },

                    // the request (extra) parameters
                    data = this._asParamArray(attrs.ep),

                    self = this,

                    // the precondition to use if there are no explicit ones
                    defaultPrecondition = [ function (attributes) {
                        if (attributes.c) {
                            if (attributes.f) {
                                return Wicket.$$(attributes.c) && Wicket.$$(attributes.f);
                            } else {
                                return Wicket.$$(attributes.c);
                            }
                        }
                        return true;
                    }],

                    // a context that brings the common data for the success/fialure/complete handlers
                    context = {
                        attrs: attrs,

                        // initialize the array for steps (closures that execute each action)
                        steps: []
                    },
                    we = Wicket.Event,
                    topic = we.Topic;

                if (Wicket.Focus.lastFocusId) {
                    headers["Wicket-FocusedElementId"] = Wicket.Focus.lastFocusId;
                }

                self._executeHandlers(attrs.bh, attrs);
                we.publish(topic.AJAX_CALL_BEFORE, attrs);

                var preconditions = attrs.pre || [];
                preconditions = defaultPrecondition.concat(preconditions);
                if (jQuery.isArray(preconditions)) {

                    var that = this._getTarget(attrs);

                    for (var p = 0; p < preconditions.length; p++) {

                        var precondition = preconditions[p];
                        var result;
                        if (jQuery.isFunction(precondition)) {
                            result = precondition.call(that, attrs);
                        } else {
                            result = new Function(precondition).call(that, attrs);
                        }
                        if (result === false) {
                            Wicket.Log.info("Ajax request stopped because of precondition check, url: " + attrs.u);
                            self.done(attrs);
                            return false;
                        }
                    }
                }

                we.publish(topic.AJAX_CALL_PRECONDITION, attrs);

                if (attrs.mp) { // multipart form. jQuery.ajax() doesn't help here ...
                    var ret = self.submitMultipartForm(context);
                    return ret;
                }

                if (attrs.f) {
                    // serialize the form with id == attrs.f
                    var form = Wicket.$(attrs.f);
                    data = data.concat(Wicket.Form.serializeForm(form));

                    // set the submitting component input name
                    if (attrs.sc) {
                        var scName = attrs.sc;
                        data = data.concat({name: scName, value: 1});
                    }

                } else if (attrs.c && !jQuery.isWindow(attrs.c)) {
                    // serialize just the form component with id == attrs.c
                    var el = Wicket.$(attrs.c);
                    data = data.concat(Wicket.Form.serializeElement(el, attrs.sr));
                }

                // convert to URL encoded string
                data = jQuery.param(data);

                // execute the request
                var jqXHR = jQuery.ajax({
                    url: attrs.u,
                    type: attrs.m,
                    context: self,
                    beforeSend: function (jqXHR, settings) {

                        // collect the dynamic extra parameters
                        if (jQuery.isArray(attrs.dep)) {
                            var queryString,
                                separator;

                            queryString = this._calculateDynamicParameters(attrs);
                            if (settings.type.toLowerCase() === 'post') {
                                separator = settings.data.length > 0 ? '&' : '';
                                settings.data = settings.data + separator + queryString;
                                jqXHR.setRequestHeader("Content-Type", settings.contentType);
                            } else {
                                separator = settings.url.indexOf('?') > -1 ? '&' : '?';
                                settings.url = settings.url + separator + queryString;
                            }
                        }

                        self._executeHandlers(attrs.bsh, attrs, jqXHR, settings);
                        we.publish(topic.AJAX_CALL_BEFORE_SEND, attrs, jqXHR, settings);

                        if (attrs.i) {
                            // show the indicator
                            Wicket.DOM.showIncrementally(attrs.i);
                        }
                    },
                    data: data,
                    dataType: attrs.dt,
                    async: attrs.async,
                    timeout: attrs.rt,
                    cache: false,
                    headers: headers,
                    success: function(data, textStatus, jqXHR) {
                        if (attrs.wr) {
                            self.processAjaxResponse(data, textStatus, jqXHR, context);
                        } else {
                            self._executeHandlers(attrs.sh, attrs, jqXHR, data, textStatus);
                            we.publish(topic.AJAX_CALL_SUCCESS, attrs, jqXHR, data, textStatus);
                        }
                    },
                    error: function(jqXHR, textStatus, errorMessage) {
                        self.failure(context, jqXHR, errorMessage, textStatus);
                    },
                    complete: function (jqXHR, textStatus) {

                        context.steps.push(jQuery.proxy(function (notify) {
                            if (attrs.i && context.isRedirecting !== true) {
                                Wicket.DOM.hideIncrementally(attrs.i);
                            }

                            self._executeHandlers(attrs.coh, attrs, jqXHR, textStatus);
                            we.publish(topic.AJAX_CALL_COMPLETE, attrs, jqXHR, textStatus);

                            self.done(attrs);
                            return FunctionsExecuter.DONE;
                        }, self));

                        var executer = new FunctionsExecuter(context.steps);
                        executer.start();
                    }
                });

                // execute after handlers right after the Ajax request is fired
                self._executeHandlers(attrs.ah, attrs);
                we.publish(topic.AJAX_CALL_AFTER, attrs);

                return jqXHR;
            }
        }

    };
})();

