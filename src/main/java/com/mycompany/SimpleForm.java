package com.mycompany;

import org.apache.wicket.ajax.AjaxRequestTarget;
import org.apache.wicket.ajax.markup.html.form.AjaxButton;
import org.apache.wicket.markup.html.WebMarkupContainer;
import org.apache.wicket.markup.html.WebPage;
import org.apache.wicket.markup.html.basic.Label;
import org.apache.wicket.markup.html.form.DropDownChoice;
import org.apache.wicket.markup.html.form.Form;
import org.apache.wicket.markup.html.form.TextArea;
import org.apache.wicket.markup.html.form.TextField;
import org.apache.wicket.model.IModel;
import org.apache.wicket.model.LambdaModel;
import org.apache.wicket.model.Model;

import java.util.Arrays;

public class SimpleForm extends WebPage {

    private final WebMarkupContainer submittedData;
    IModel<String> textFieldModel = Model.of();
    IModel<String> textAreaModel = Model.of();
    IModel<String> dropDownModel = Model.of();

    public SimpleForm() {
        final Form<Object> form = new Form<>("form");
        add(form);
        form.add(new TextField<>("textField", textFieldModel));
        form.add(new TextArea<>("textArea", textAreaModel));
        form.add(new DropDownChoice<>("dropDown", dropDownModel, Arrays.asList("A", "B", "C")));
        form.add(new AjaxButton("submit") {
            @Override
            protected void onSubmit(AjaxRequestTarget target) {
                super.onSubmit(target);
                target.add(submittedData);
            }
        });
        submittedData = new WebMarkupContainer("submittedData");
        submittedData.setOutputMarkupId(true);
        add(submittedData);
        submittedData.add(new Label("textFieldSubmitted", textFieldModel));
        submittedData.add(new Label("textAreaSubmitted", textAreaModel));
        submittedData.add(new Label("dropDownSubmitted", dropDownModel));
    }

}
