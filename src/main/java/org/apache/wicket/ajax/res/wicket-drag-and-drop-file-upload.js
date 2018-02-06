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
        var onChangeUpload = attrs['onChangeUpload'];
        var fileUploadComponentId = attrs['c'];
        var progressContainer = document.getElementById(attrs['progressContainer'] || attrs['dropArea']);
        var dropArea = document.getElementById(dropAreaId);
        var fileUpload = document.getElementById(fileUploadComponentId);
        var downloadInOneChunk = false;
        if (!((('draggable' in dropArea) || ('ondragstart' in dropArea && 'ondrop' in dropArea)) && 'FormData' in window && 'FileReader' in window && 'classList' in dropArea)) {
            Wicket.Log.error("WicketFileDragAndDropBehaviour is not supported by this browser");
            return
        }

        dropArea.classList.add("wicket-file-drag-and-drop--supported");

        /* progress handlers */
        var onUploadStart = attrs["onProgressStart"] || function(context, attrs, files) {
            var p = document.createElement("li");
            p.innerHTML = "loading "+files.map(function (file) {
                return file.name;
            }).join("; ")+"...";
            context.container.appendChild(p);
            context.item = p;
            context.item.style.border = "1px solid grey";
            context.progress = context.item.appendChild(document.createElement("div"));
            context.progress.innerHTML = "Pending";
            context.progress.style.width = "0%";
            context.progress.style.backgroundColor = "#72c6ff";
            context.cancelButton = context.item.appendChild(document.createElement("a"));
            context.cancelButton.innerHTML = "Cancel";
            context.cancelButton.setAttribute("href", "#");
            context.cancelButton.setAttribute("alt", "Cancel");
            context.cancelButton.setAttribute("title", "Cancel");
            context.cancelButton.addEventListener("click", function (e) {
                context.cancelled = true;
                try {
                    context.item.removeChild(context.progress);
                    context.item.removeChild(context.cancelButton);
                    context.item.innerText += ": Cancelled";
                } finally {}
                if(context.xhr.readyState > 0 && context.xhr.readyState < 4) {
                    context.xhr.abort();
                }
                e.preventDefault();
            });
        };
        var onUploadProgress = attrs["onProgress"] ||  function(context, attrs, progress) {
            var pv = Math.round(progress)+"%";
            context.progress.style.width = pv;
            context.progress.innerHTML = pv;
        };
        var onUploadSuccess = attrs["sh"] || function(context) {
            context.container.removeChild(context.item)
        };
        var onUploadFailure = attrs["fh"] || function(context) {
            if (!context.cancelled) {
                context.item.innerHTML += ": failed!";
            }
        };

        function dropHandler(ev) {
            ev.preventDefault();
            Wicket.Log.info("DragAndDropFileUpload drop " + dropAreaId);
            var dt = ev.dataTransfer;
            uploadFiles(dt);
        }

        function uploadFiles(dataTransfer) {
            var files = dataTransfer.items ? prepareFilesToUploadFromDataTransferItemList(dataTransfer.items) : prepareFilesToUpload(dataTransfer.files);
            if (downloadInOneChunk) {
                ajaxUpload(files);
            } else {
                files.forEach(function (file) {
                    ajaxUpload([file])
                });
            }
        }

        /**
         * Prepare files array from DataTransferItemList or FilesList
         */
        function prepareFilesToUploadFromDataTransferItemList(dataItems) {
            var files = [];
            if (dataItems && dataItems.length > 0) {
                for (var i = 0; i < dataItems.length; i++) {
                    if (dataItems[i].kind == "file") {
                        var f = dataItems[i].getAsFile();
                        Wicket.Log.info("... file[" + i + "].name = " + f.name);
                        files.push(f);
                    }
                }
            }
            return files;
        }

        /**
         * Prepare files array from DataTransfer
         */
        function prepareFilesToUpload(filesList) {
            // could be Array.from
            var files = [];
            if (filesList && filesList.length > 0) {
                for (var i = 0; i < filesList.length; i++) {
                    Wicket.Log.info("... file[" + i + "].name = " + filesList[i].name);
                    files.push(filesList[i]);
                }
            }
            return files;
        }

        function ajaxUpload(files) {
            if (files && files.length > 0) {
                var xhr = new window.XMLHttpRequest();
                var uploadContext = {
                    "container": progressContainer,
                    "xhr": xhr,
                    "item": null,
                    "cancelled": false
                };
                if (progressContainer) {
                    onUploadStart(uploadContext, attrs, files);
                }
                Wicket.Ajax.ajax({
                    u: attrs.u,
                    m: 'POST',
                    mp: true,
                    ep: files.map(function (f) {
                        return {
                            'name': fileUpload.getAttribute("name"),
                            'value': f
                        }
                    }),
                    bsh: [
                        function (attributes, jqXHR, settings) {
                            settings.xhr = function () {
                                try {
                                    if (uploadContext.cancelled) {
                                        return null;
                                    }
                                    if (uploadContext.item) {
                                        /* Add progress indicator */
                                        xhr.upload.addEventListener("progress", function (e) {
                                            var progress = Math.round(e.loaded / e.total * 100);
                                            onUploadProgress(uploadContext, attrs, progress);
                                        });
                                    }
                                    return xhr;
                                } catch (e) {
                                }
                            }
                        }
                    ],
                    sh: [
                        function (attrs) {
                            /* Success handler */
                            onUploadSuccess(uploadContext, attrs);
                        }
                    ],
                    fh: [
                        function (attrs, jqXHR, errorMessage, textStatus) {
                            /* failure handler */
                            onUploadFailure(uploadContext, attrs, jqXHR, errorMessage, textStatus);
                        }
                    ]
                });
            } else {
                Wicket.Log.error("No files to upload " + dropAreaId);
            }
        }

        function changeHandler(ev) {
            ev.preventDefault();
            Wicket.Log.info("DragAndDropFileUpload change " + dropAreaId);
            if (fileUpload.files && fileUpload.files.length > 0) {
                uploadFiles(fileUpload)
            }
        }

        function dragOverHandler(ev) {
            ev.preventDefault();
            Wicket.Log.info("DragAndDropFileUpload dragover " + dropAreaId);
            dropArea.classList.add("wicket-file-drag-and-drop--drag-over")
        }

        function dragEnterHandler(ev) {
            ev.preventDefault();
            Wicket.Log.info("DragAndDropFileUpload dragenter " + dropAreaId);
            dropArea.classList.add("wicket-file-drag-and-drop--drag-over")
        }

        function dragEndHandler(ev) {
            Wicket.Log.info("DragAndDropFileUpload dragend " + dropAreaId);
            dropArea.classList.remove("wicket-file-drag-and-drop--drag-over");
            var dt = ev.dataTransfer;
            if (dt.items) {
                dt.items.clear();
            } else {
                dt.clearData();
            }
        }

        dropArea.addEventListener("drop", dropHandler);
        dropArea.addEventListener("dragover", dragOverHandler);
        dropArea.addEventListener("dragenter", dragEnterHandler);
        dropArea.addEventListener("dragleave", dragEndHandler);
        dropArea.addEventListener("dragend", dragEndHandler);
        if (onChangeUpload) {
            fileUpload.addEventListener("change", changeHandler);
        }

    };
})();

