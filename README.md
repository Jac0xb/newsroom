# Newsroom App

Typescript source code for the Newsroom Web App

## Authors

Jacob Brown, Connor Kuhn, August Masquelier, Jacob Valentine

## Getting Started

1. Clone this repo.
2. Install yarn globally: `npm install -g yarn`
3. Install dependencies for all submodules: `yarn install`
4. Build all submodules: `yarn build`
5. Start newsroom-api: `cd newsroom-api && yarn run start`
6. Star UI: `cd ui && yarn run start`

## Architecture

### [ui](ui)

React.js based code for the UI of the app.

### [newsroom-api](newsroom-api)

Contains endpoints for workflows, stages, users, and roles as well as different
database entity infrastructure and migrations.

Copyright &copy; 2019 Jacob Brown, Connor Kuhn, August Masquelier, Jacob Valentine