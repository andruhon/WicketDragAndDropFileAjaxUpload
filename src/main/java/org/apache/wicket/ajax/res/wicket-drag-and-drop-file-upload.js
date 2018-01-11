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
        var dropArea = document.getElementById(dropAreaId);
        var fileUpload = document.getElementById(fileUploadComponentId);
        if (!((('draggable' in dropArea) || ('ondragstart' in dropArea && 'ondrop' in dropArea)) && 'FormData' in window && 'FileReader' in window && 'classList' in dropArea)) {
            Wicket.Log.error("WicketFileDragAndDropBehaviour is not supported by this browser");
            return
        }

        dropArea.classList.add("wicket-file-drag-and-drop--supported");

        function dropHandler(ev) {
            ev.preventDefault();
            Wicket.Log.info("DragAndDropFileUpload drop " + dropAreaId);
            var dt = ev.dataTransfer;
            var files = dt.items ? prepareFilesToUploadFromDataTransferItemList(dt.items) : prepareFilesToUpload(dt.files);
            uploadFiles(files);
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

        function uploadFiles(files) {
            if (files && files.length > 0) {
                Wicket.Ajax.ajax({
                    u: attrs.u,
                    m: 'POST',
                    mp: true,
                    ep: files.map(function (f) {
                        return {
                            'name': fileUpload.getAttribute("name"),
                            'value': f
                        }
                    })
                });
            } else {
                Wicket.Log.error("No files to upload " + dropAreaId);
            }
        }

        function changeHandler(ev) {
            ev.preventDefault();
            Wicket.Log.info("DragAndDropFileUpload change " + dropAreaId);
            if (fileUpload.files && fileUpload.files.length > 0) {
                uploadFiles(prepareFilesToUpload(fileUpload.files))
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

