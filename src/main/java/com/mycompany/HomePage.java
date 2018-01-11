package com.mycompany;

import org.apache.wicket.markup.html.WebPage;
import org.apache.wicket.markup.html.link.BookmarkablePageLink;

public class HomePage extends WebPage {
    private static final long serialVersionUID = 1L;

    public HomePage() {
        add(new BookmarkablePageLink<SubmittingDemo>("submittingDemoLink", SubmittingDemo.class));
        add(new BookmarkablePageLink<SubmittingDemo>("eventDemoLink", EventDemo.class));
    }
}
