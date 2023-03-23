# Moodr

Created by Peter Marley.

This ExpressJS web application and API were developed as the assessment for the CSC7084 Web Development module.

To start the application you must:
- start XAMPP, and start the Apache Server and MySQL modules.
- ensure the moodr database has been imported and a user created with appropriate access. The user account's password should be set and this value added to the `.env` file.
- `cd` to the web applications root folder and execute either:
    - `npm run start:dev` to run the application with nodemon for development purposes
    - `npm run start` to run the application with ts-node