package com.mycompany;

import org.apache.wicket.markup.html.WebPage;
import org.apache.wicket.protocol.http.WebApplication;

public class WicketApplication extends WebApplication
{
	@Override
	public Class<? extends WebPage> getHomePage()
	{
		return HomePage.class;
	}

	@Override
	public void init()
	{
		super.init();
		mountPage("/simpleform", SimpleForm.class);
		mountPage("/eventdemo", EventDemo.class);
		mountPage("/ajaxfileupload", AjaxFileUploadDemo.class);
		mountPage("/submittingdemo", SubmittingDemo.class);

	}
}
