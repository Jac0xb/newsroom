# Newsroom App

Typescript source code for the Newsroom Web App

## Authors

Jacob Brown, Connor Kuhn, August Masquelier, Jacob Valentine

## Architecture

### [common](common)

Contains code that provides common code and models shared between other components.

### [ui](ui)

React.js based code for the UI of the app.

### [document-api](document-api)

Exposes an interface for the querying of data related to documents, and for the
manipulation and versioning of documents in the database.

### [workflow-api](workflow-api)

Exposes an interface for tracking and managing workflows and their individual stages.
Tracking workflows involves querying the state of the workflow in relation to a
particular document or a group of documents.

### [user-api](user-api)

A simple user management interface that stores non-critical data as plain text
and critical data as encrypted and hashed data in the database.

### [event-api](event-api)

Exposes an interface for the managing of events which contain the group-defined
documents and the storing/updating of their grouped state within the database.

### [integration-api](integration-api)

Defines information in the database that will be queried and utilized to form
different kinds of notifications/integrations each time interfacing is done 
with the UI.

### [statistics-api](statistics-api)

Exposes an interface for querying statistical data which has been recorded by
other microservices and stored in the database.

Copyright &copy; 2019 Jacob Brown, Connor Kuhn, August Masquelier, Jacob Valentine