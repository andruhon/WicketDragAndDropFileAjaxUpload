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
    };
})();

