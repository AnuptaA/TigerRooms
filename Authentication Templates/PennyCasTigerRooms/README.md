# pennycas

--------------

To run this application on your computer using the Flask test HTTP/WSGI server:

Create an APP_SECRET_KEY environment variable
   (Mac or Linux) export APP_SECRET_KEY=<somesecretkey>
   (MS Windows) set APP_SECRET_KEY=<somesecretkey>


Run the test server
   python runserver.py <someport>

Run a browser on the same computer as the one on which the application is running.

In the browser, browse to http://localhost:<someport>
The URL that you provide to the browser must use "localhost" as the host.
It cannot use the real IP address of the host or "0.0.0.0".

--------------

To run this application on a local MS Windows computer using the Flask test HTTP server:

Create an APP_SECRET_KEY environment variable
   set APP_SECRET_KEY=<somesecretkey>

Run the test server
   python runserver.py <someport>

Run a browser on the same computer as the one on which the application is running.

In the browser, browse to http://localhost:<someport>
   The URL that you provide to the browser must use "localhost" as the host.
   It cannot use the real IP address of the host or "0.0.0.0".

---------------

To run this application on Render:

Deploy the application to Render as usual.

Configure the application such that it has an environment variable
whose name is APP_SECRET_KEY and whose value is some secret key.

Ask OIT to place your Render app (as identified by its URL) on the Princeton CAS white list.  The COS 333 "Princeton Data Sources" web page describes how to do that.

Run a browser on the any computer.

In the browser, browse to http://domainname
   where http://domainname is the URL of the Render app.
