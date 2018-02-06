package com.mycompany;

import org.apache.commons.fileupload.FileUploadException;
import org.apache.wicket.ajax.AjaxRequestTarget;
import org.apache.wicket.ajax.DragAndDropFileAjaxUploadBehavior;
import org.apache.wicket.markup.html.WebMarkupContainer;
import org.apache.wicket.markup.html.form.upload.FileUpload;
import org.apache.wicket.request.mapper.parameter.PageParameters;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Fire ajax event when files dragged into the drop area
 */
public class EventDemo extends AbstractDemoUploadPage {

    public EventDemo() {
        this(null);
    }

    public EventDemo(PageParameters parameters) {
        super(parameters);
        filesField.add(new DragAndDropFileAjaxUploadBehavior(dragAndDropArea, true) {
            @Override
            protected void onFilesUpload(AjaxRequestTarget target, List<FileUpload> fileUploads) {
                System.out.println("onFileUpload");
                System.out.println(fileUploads);
                fileNamesModel.getObject().addAll(fileUploads.stream().map(FileUpload::getClientFileName).collect(Collectors.toList()));
                filesField.setModelValue(null);
                target.add(dragAndDropArea, filesField, uploads);
            }

            @Override
            protected void onFilesUploadException(AjaxRequestTarget target, FileUploadException e, Map<String, Object> model) {
                messageModel.setObject(e.getMessage());
                target.add(messageLabel);
                System.out.println(e);
            }

            @Override
            protected WebMarkupContainer getProgressContainer() {
                return progress;
            }
        });
    }
}
