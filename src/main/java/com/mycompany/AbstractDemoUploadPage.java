package com.mycompany;

import org.apache.wicket.markup.html.WebMarkupContainer;
import org.apache.wicket.markup.html.WebPage;
import org.apache.wicket.markup.html.basic.Label;
import org.apache.wicket.markup.html.form.Form;
import org.apache.wicket.markup.html.form.upload.FileUpload;
import org.apache.wicket.markup.html.form.upload.FileUploadField;
import org.apache.wicket.markup.html.list.ListItem;
import org.apache.wicket.markup.html.list.ListView;
import org.apache.wicket.model.IModel;
import org.apache.wicket.model.Model;
import org.apache.wicket.request.mapper.parameter.PageParameters;
import org.apache.wicket.util.lang.Bytes;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public abstract class AbstractDemoUploadPage extends WebPage {

    protected static Bytes MAX_FILE_SIZE = Bytes.bytes(5000000);

    protected final FileUploadField filesField;
    protected final IModel<List<String>> fileNamesModel = Model.ofList(new ArrayList<>());
    protected final WebMarkupContainer uploads;
    protected final IModel<String> messageModel = Model.of("message");
    protected WebMarkupContainer dragAndDropArea;
    protected Label messageLabel;
    protected WebMarkupContainer progress;
    protected Form<Object> form;

    public AbstractDemoUploadPage() {
        this(null);
    }

    public AbstractDemoUploadPage(PageParameters parameters) {
        super(parameters);
        add(new Label("title", getClass().getSimpleName()));
        form = new Form<Object>("form") {
            @Override
            protected void onSubmit() {
                super.onSubmit();
                fileNamesModel.getObject().addAll(filesField.getFileUploads().stream().map(FileUpload::getClientFileName).collect(Collectors.toList()));
                System.out.println("form onSubmit");
                System.out.println(filesField.getFileUploads());
            }
        };
        form.setMultiPart(true);
        form.setFileMaxSize(MAX_FILE_SIZE);
        add(form);

        // TODO progress indicator see UploadProgressBar

        messageLabel = new Label("message", messageModel);
        messageLabel.setOutputMarkupId(true);
        add(messageLabel);

        dragAndDropArea = new WebMarkupContainer("dragAndDropArea");
        filesField = new FileUploadField("files");
        filesField.setOutputMarkupId(true);
        dragAndDropArea.add(filesField);

        form.add(dragAndDropArea);

        progress = new WebMarkupContainer("progress");
        add(progress);

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
