package com.mycompany;

import org.apache.commons.fileupload.FileUploadException;
import org.apache.wicket.ajax.AjaxRequestTarget;
import org.apache.wicket.extensions.ajax.AjaxFileDropBehavior;
import org.apache.wicket.markup.html.form.upload.FileUpload;
import org.apache.wicket.request.mapper.parameter.PageParameters;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Fire ajax event when files dragged into the drop area
 */
public class AjaxFileUploadDemo extends AbstractDemoUploadPage {

    public AjaxFileUploadDemo() {
        this(null);
    }

    public AjaxFileUploadDemo(PageParameters parameters) {
        super(parameters);

        AjaxFileDropBehavior onFileUpload = new AjaxFileDropBehavior() {
            @Override
            protected void onFileUpload(AjaxRequestTarget target, List<FileUpload> files) {
                System.out.println("onFileUpload");
                System.out.println(files);
                fileNamesModel.getObject().addAll(files.stream().map(FileUpload::getClientFileName).collect(Collectors.toList()));
                filesField.setModelValue(null);
                target.add(dragAndDropArea, filesField, uploads);
            }

            @Override
            protected void onError(AjaxRequestTarget target, FileUploadException fux) {
                messageModel.setObject(fux.getMessage());
                target.add(messageLabel);
            }
        };
        onFileUpload.setMaxSize(MAX_FILE_SIZE);
        onFileUpload.setFileMaxSize(MAX_FILE_SIZE);
        dragAndDropArea.add(onFileUpload);

    }
}
