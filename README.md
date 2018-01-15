Building the demo
=================
Testing file drag and drop possible with https://github.com/apache/wicket/pull/256/files (WICKET-6517)

Download, build and install with `mvn package` and `mvn install`
to to make this project use it from your local maven repository.  

Running the demo
================
`mvn clean compile jetty:run -Djetty.port=8888 -Djetty.https.port=4433`

in powershell:  
`PS> mvn clean compile jetty:run -"Djetty.port"=8888 -"Djetty.https.port"=4433`