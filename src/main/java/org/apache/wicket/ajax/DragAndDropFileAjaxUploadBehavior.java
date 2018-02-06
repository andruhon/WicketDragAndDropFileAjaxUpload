package org.apache.wicket.ajax;

import org.apache.commons.fileupload.FileUploadException;
import org.apache.wicket.Component;
import org.apache.wicket.ajax.attributes.AjaxRequestAttributes;
import org.apache.wicket.markup.head.IHeaderResponse;
import org.apache.wicket.markup.head.JavaScriptHeaderItem;
import org.apache.wicket.markup.html.WebMarkupContainer;
import org.apache.wicket.markup.html.form.Form;
import org.apache.wicket.markup.html.form.upload.FileUpload;
import org.apache.wicket.markup.html.form.upload.FileUploadField;
import org.apache.wicket.protocol.http.servlet.MultipartServletWebRequest;
import org.apache.wicket.protocol.http.servlet.ServletWebRequest;
import org.apache.wicket.request.resource.JavaScriptResourceReference;
import org.apache.wicket.request.resource.ResourceReference;
import org.apache.wicket.util.lang.Args;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author Andrew Kondratev
 */
public abstract class DragAndDropFileAjaxUploadBehavior extends AjaxEventBehavior {

    private static final ResourceReference JS = new JavaScriptResourceReference(DragAndDropFileAjaxUploadBehavior.class, "res/wicket-drag-and-drop-file-upload.js");
    private final Component dropArea;
    private final boolean onChangeUpload;

    public DragAndDropFileAjaxUploadBehavior(WebMarkupContainer dropArea) {
        this(dropArea, false);
    }

    /**
     * @param dropArea
     * @param onChangeUpload - auto upload on file input change
     */
    public DragAndDropFileAjaxUploadBehavior(WebMarkupContainer dropArea, boolean onChangeUpload) {
        super("drop");
        Args.notNull(dropArea, "dropArea");
        this.dropArea = dropArea;
        this.onChangeUpload = onChangeUpload;
        // TODO add check component
    }

    @Override
    protected CharSequence getCallbackScript(Component component) {
        return
            "Wicket.Ajax.DragAndDropFileUpload({" +
                "dropArea:'" + dropArea.getMarkupId() + "'" +
                ", c:'" + getFileUploadField().getMarkupId() + "'" +
                ", f:'" + getFileUploadField().getForm().getMarkupId() + "'" +
                ", u:'" + getCallbackUrl() + "'" +
                (getProgressContainer() != null ? (",\"progressContainer\":\"" + getProgressContainer().getMarkupId() + "\"") : "") +
                ", onChangeUpload: " + (onChangeUpload ? "true" : "false") +
            "})";
    }

    protected FileUploadField getFileUploadField() {
        return (FileUploadField) getComponent();
    }

    @Override
    public void renderHead(Component component, IHeaderResponse response) {
        super.renderHead(component, response);
        response.render(JavaScriptHeaderItem.forReference(JS));
    }

    @Override
    protected void updateAjaxAttributes(AjaxRequestAttributes attributes) {
        super.updateAjaxAttributes(attributes);
        attributes.setMultipart(true);
        attributes.setMethod(AjaxRequestAttributes.Method.POST);
    }

    @Override
    protected void onEvent(AjaxRequestTarget target) {
        FileUploadField fileUploadField = getFileUploadField();
        Form<?> form = fileUploadField.getForm();
        // Change the request to a multipart to parse parameters
        try {
            ServletWebRequest request = (ServletWebRequest) form.getRequest();
            final MultipartServletWebRequest multipartWebRequest = request.newMultipartWebRequest(
                    fileUploadField.getForm().getMaxSize(), form.getPage().getId());
            multipartWebRequest.setFileMaxSize(fileUploadField.getForm().getFileMaxSize());
            multipartWebRequest.parseFileParts();

            form.getRequestCycle().setRequest(multipartWebRequest);

            onFilesUpload(target, fileUploadField.getFileUploads());
        } catch (final FileUploadException fux) {
            // Create model with exception and maximum size values
            final Map<String, Object> model = new HashMap<>();
            model.put("exception", fux);
            model.put("maxSize", form.getMaxSize());
            model.put("fileMaxSize", form.getFileMaxSize());

            onFilesUploadException(target, fux, model);
        }
    }

    protected WebMarkupContainer getProgressContainer() {
        return null;
    };

    protected abstract void onFilesUpload(AjaxRequestTarget target, List<FileUpload> fileUploads);

    protected abstract void onFilesUploadException(AjaxRequestTarget target, final FileUploadException e, final Map<String, Object> model);

}
