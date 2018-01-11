package org.apache.wicket.ajax;

import org.apache.wicket.Component;
import org.apache.wicket.ajax.form.AjaxFormSubmitBehavior;
import org.apache.wicket.markup.head.IHeaderResponse;
import org.apache.wicket.markup.head.JavaScriptHeaderItem;
import org.apache.wicket.markup.html.WebMarkupContainer;
import org.apache.wicket.markup.html.form.Form;
import org.apache.wicket.markup.html.form.upload.FileUploadField;
import org.apache.wicket.request.resource.JavaScriptResourceReference;
import org.apache.wicket.request.resource.ResourceReference;
import org.apache.wicket.util.lang.Args;

/**
 * @author Andrew Kondratev
 */
public class DragAndDropFileUploadAjaxFormSubmittingBehavior extends AjaxFormSubmitBehavior {

    private static final ResourceReference JS = new JavaScriptResourceReference(DragAndDropFileAjaxUploadBehavior.class, "res/wicket-drag-and-drop-file-upload.js");
    private final WebMarkupContainer dropArea;

    public DragAndDropFileUploadAjaxFormSubmittingBehavior(Form<?> form, WebMarkupContainer dropArea) {
        super(form, "drop");
        Args.notNull(dropArea, "dropArea");
        this.dropArea = dropArea;
        // TODO add check component
    }

    public DragAndDropFileUploadAjaxFormSubmittingBehavior(WebMarkupContainer dropArea) {
        this(null, dropArea);
    }

    protected FileUploadField getFileUploadField() {
        return (FileUploadField) getComponent();
    }

    @Override
    protected CharSequence getCallbackScript(Component component) {
        return
            "Wicket.Ajax.DragAndDropFileUpload({" +
                    "dropArea:'" + dropArea.getMarkupId() + "'," +
                    "c:'" + getFileUploadField().getMarkupId() + "'," +
                    "f:'" + getForm().getMarkupId() + "'," +
                    "u:'" + getCallbackUrl() + "'" +
            "})";
    }

    @Override
    public void renderHead(Component component, IHeaderResponse response) {
        super.renderHead(component, response);
        response.render(JavaScriptHeaderItem.forReference(JS));
    }

}