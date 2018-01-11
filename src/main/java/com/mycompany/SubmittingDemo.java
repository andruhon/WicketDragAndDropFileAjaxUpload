package com.mycompany;

import org.apache.wicket.ajax.AjaxRequestTarget;
import org.apache.wicket.ajax.DragAndDropFileUploadAjaxFormSubmittingBehavior;
import org.apache.wicket.ajax.form.AjaxFormSubmitBehavior;
import org.apache.wicket.ajax.form.OnChangeAjaxBehavior;
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
import java.util.stream.Collectors;

/**
 * Ajax Submit form when files dragged into the drop area or selected in the file input
 */
public class SubmittingDemo extends WebPage {

    private final FileUploadField filesField;

    private final IModel<List<String>> fileNamesModel = Model.ofList(new ArrayList<>());
    private WebMarkupContainer uploads;

    public SubmittingDemo() {
        this(null);
    }

    public SubmittingDemo(PageParameters parameters) {
        super(parameters);
        add(new BookmarkablePageLink<EventDemo>("eventDemoLink", EventDemo.class));

        final Form<Object> form = new Form<Object>("form") {
            @Override
            protected void onSubmit() {
                super.onSubmit();
                System.out.println("form onSubmit");
                List<FileUpload> fileUploads = filesField.getFileUploads();
                System.out.println(fileUploads);
                fileNamesModel.getObject().addAll(fileUploads.stream().map(FileUpload::getClientFileName).collect(Collectors.toList()));
            }
        };
        form.setMultiPart(true);
        form.setFileMaxSize(Bytes.bytes(5000000));
        add(form);

        WebMarkupContainer dragAndDropArea = new WebMarkupContainer("dragAndDropArea");
        filesField = new FileUploadField("files");
        dragAndDropArea.add(filesField);

        filesField.add(new DragAndDropFileUploadAjaxFormSubmittingBehavior(dragAndDropArea) {
            @Override
            protected void onSubmit(AjaxRequestTarget target) {
                super.onSubmit(target);
                target.add(uploads);
            }
        });

        // Submit form when files selected
        filesField.add(new AjaxFormSubmitBehavior(form, "change") {
            @Override
            protected void onSubmit(AjaxRequestTarget target) {
                super.onSubmit(target);
                System.out.println("input change onSubmit");
                filesField.setModelValue(null);
                target.add(dragAndDropArea, filesField, uploads);
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
