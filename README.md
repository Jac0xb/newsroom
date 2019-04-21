# Newsroom App

Typescript source code for the Newsroom Web App

## Authors

Jacob Brown, Connor Kuhn, August Masquelier, Jacob Valentine

## Getting Started

1. Clone this repo.
2. Install yarn globally: `npm install -g yarn`
3. Install dependencies for all submodules: `yarn install`
4. Build all submodules: `yarn build`
5. Start newsroom-api: `yarn workspace newsroom-api start` or `cd newsroom-api && yarn start`.
6. Star UI: ?

## Architecture

### [orm](orm)

Contains code that provides common ORM Entities for all modules, subject to moving.

### [ui](ui)

React.js based code for the UI of the app.

### [newsroom-api](newsroom-api)

Currently contains the `/documents` and `/workflows` APIs. Subject to renaming
if other microservices are added.

Copyright &copy; 2019 Jacob Brown, Connor Kuhn, August Masquelier, Jacob Valentine