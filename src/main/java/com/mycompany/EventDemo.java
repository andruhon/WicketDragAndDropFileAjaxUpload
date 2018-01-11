package com.mycompany;

import org.apache.commons.fileupload.FileUploadException;
import org.apache.wicket.ajax.AjaxRequestTarget;
import org.apache.wicket.ajax.DragAndDropFileAjaxUploadBehavior;
import org.apache.wicket.markup.html.WebMarkupContainer;
import org.apache.wicket.markup.html.WebPage;
import org.apache.wicket.markup.html.basic.Label;
import org.apache.wicket.markup.html.form.Form;
import org.apache.wicket.markup.html.form.upload.FileUpload;
import org.apache.wicket.markup.html.form.upload.FileUploadField;
import org.apache.wicket.markup.html.link.BookmarkablePageLink;
import org.apache.wicket.markup.html.list.ListItem;
import org.apache.wicket.markup.html.list.ListView;
import org.apache.wicket.model.IModel;
import org.apache.wicket.model.Model;
import org.apache.wicket.request.mapper.parameter.PageParameters;
import org.apache.wicket.util.lang.Bytes;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Fire ajax event when files dragged into the drop area
 */
public class EventDemo extends WebPage {

    private final FileUploadField filesField;

    private final IModel<List<String>> fileNamesModel = Model.ofList(new ArrayList<>());
    private final WebMarkupContainer uploads;

    public EventDemo() {
        this(null);
    }

    public EventDemo(PageParameters parameters) {
        super(parameters);
        add(new BookmarkablePageLink<SubmittingDemo>("submittingDemoLink", SubmittingDemo.class));

        Form<Object> form = new Form<Object>("form") {
            @Override
            protected void onSubmit() {
                super.onSubmit();
                fileNamesModel.getObject().addAll(filesField.getFileUploads().stream().map(FileUpload::getClientFileName).collect(Collectors.toList()));
                System.out.println("form onSubmit");
                System.out.println(filesField.getFileUploads());
            }
        };
        form.setMultiPart(true);
        form.setFileMaxSize(Bytes.bytes(50000));
        add(form);

        // TODO progress indicator see UploadProgressBar

        WebMarkupContainer dragAndDropArea = new WebMarkupContainer("dragAndDropArea");
        filesField = new FileUploadField("files");
        dragAndDropArea.add(filesField);

        filesField.add(new DragAndDropFileAjaxUploadBehavior(dragAndDropArea) {
            @Override
            protected void onFilesUpload(AjaxRequestTarget target, List<FileUpload> fileUploads) {
                System.out.println("onFileUpload");
                System.out.println(fileUploads);
                fileNamesModel.getObject().addAll(fileUploads.stream().map(FileUpload::getClientFileName).collect(Collectors.toList()));
                target.add(uploads);
            }

            @Override
            protected void onFilesUploadException(AjaxRequestTarget target, FileUploadException e, Map<String, Object> model) {
                System.out.println(e);
            }
        });

        form.add(dragAndDropArea);

        uploads = new WebMarkupContainer("uploads");
        uploads.setOutputMarkupId(true);
        uploads.add(new ListView<String>("uploadItem", fileNamesModel) {
            @Override
            protected void populateItem(ListItem item) {
                item.add(new Label("filename", item.getModel()));
            }
        });
        add(uploads);
    }
}
