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
public class SubmittingDemo extends AbstractDemoUploadPage {

    public SubmittingDemo() {
        this(null);
    }

    public SubmittingDemo(PageParameters parameters) {
        super(parameters);

        filesField.add(new DragAndDropFileUploadAjaxFormSubmittingBehavior(dragAndDropArea) {
            @Override
            protected void onSubmit(AjaxRequestTarget target) {
                super.onSubmit(target);
                target.add(uploads);
            }

            @Override
            protected void onError(AjaxRequestTarget target) {
                super.onError(target);
                messageModel.setObject("an error happened");
                target.add(messageLabel);
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

            @Override
            protected void onError(AjaxRequestTarget target) {
                super.onError(target);
                messageModel.setObject("an error happened");
                target.add(messageLabel);
            }
        });

    }

}
