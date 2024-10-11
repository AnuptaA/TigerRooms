# pennyauth0

--------------

# To run this application on your computer using the Flask test HTTP server:

Browse to this address: https://auth0.com

Sign up for a new account, or login to your existing account. Signing up for a new account requires you to provide an email address, but not a credit card number.

Click on "Applications -> Applications".

Click on "Create Application". For "Name" enter Penny. For "application type" chose "Regular Web Applications". Click "Create".

Navigate back to the dashboard page.

Click on "Applications -> Applications".

Click on "Penny".

Note the Domain, ClientID, and Client Secret.

For "Allowed Callback URLs" enter this: http://localhost:3000/callback

For "Allowed Logout URLs" enter this: http://localhost:3000/loggedout

Click "Save Changes".

Leave the Auth0 website, if you want.

Create a file named .env in your application directory. Place these lines in the file:

    APP_SECRET_KEY=<any secret key you want>
    AUTH0_CLIENT_ID=<the Auth0 ClientID>
    AUTH0_CLIENT_SECRET=<the Auth0 Client Secret>
    AUTH0_DOMAIN=<the Auth0 Domain>

In a terminal window execute this command: python runserver.py

Browse to http://localhost:3000

---------------

# To run this application on Render:

Push the application to a GitHub repo, and create a new Render application linked to the GitHub repo as usual.

Configure the application such that it has environment variables named APP_SECRET_KEY, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, and AUTH0_DOMAIN having the same values as you placed in your .env file

Deploy the application from GitHub to Render as usual.

Run the application from a browser as usual.
