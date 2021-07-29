## Project structure by modules:

- `engine3d` - is responsible to contain the logic with 3d object rendering
- `files` - the module contains the component and logic to manage files uploading
- `layout` - that module define layout of application and it's the starting point
- `shared` - all reusable parts of the appliction will be placed there
- `store` - state management files with all action, states and store will be written there
- `e2e` - folder which contain e2e tests by using Protractor
- `ui` - place with all assets: libraries, icons, fonts + html pages

<p align="center">
  <h1 align="center">Angular 10 Application</h1>
  <p align="center">
    Angular 10.0.8 + Angular CLI + Angular Universal + Lazy Loading + SSR + PWA + SEO + google Analytics + API REST (Node.js)
    <br>
    3d rendering: Babylonjs: 4.2.0 (including @core, @gui, @loaders, @materials, @serializers)
    <br>
  </p>
</p>

## Store mechanism

<pages>

<iframe width="1040" height="560" src="https://miro.com/app/embed/o9J_kl1VdZk=/?" frameborder="0" scrolling="no" allowfullscreen></iframe>

## GIT FLOW

```bash
# clone the repo
git clone https://github.com/ganatan/angular10-app.git

# change directory
cd angular10-app

# install the repo with npm
npm install

# start the server
npm start

# Generate inline documentation: modules structure, classes/components/services description
npx compodoc -p tsconfig.base.json -s

Documentation link: http://127.0.0.1:8080/overview.html

## Table of contents

- [Status](#status)
- [Quick start](#quick-start)
- [Front-end](#front-end)
- [Documentation](#documentation)

### Front-end : What's included

> Dependencies

- [x] Angular : 10.0.8
- [x] Angular CLI : 10.0.5
- [x] Angular Universal : 10.0.1
- [x] Babylonjs : 4.2.0 (including @core, @gui, @loaders, @materials, @serializers)
- [x] Bootstrap : 4.5.1
- [x] Fontawesome : 5.14.0
- [x] jquery : 3.5.1

> Features

- [x] Routing
- [x] Lazy Loading
- [x] Server Side Rendering
- [x] Progressive Web App
- [x] Responsive Layout
- [x] Search Engine Optimization (SEO)
- [x] Components
- [x] Services
- [x] inheritance
- [x] Search / Grid / Pagination
- [x] Leaflet open-source JavaScript library

```

in your browser go to [http://localhost:4200](http://localhost:4200)

## Front-end

### Installation

- `npm install` (installing dependencies)
- `npm outdated` (verifying dependencies)

### Development

- `npm run start`
- in your browser [http://localhost:4200](http://localhost:4200)

### Tests

- `npm run lint`
- `npm run test`
- `npm run e2e`

## Use Chrome version 84 min

### TSLint configuration for VScode

1. VScode configuration inside settings.json
   It will update the linting on file save based on the project's tslint.json.

```
   "editor.formatOnSave": true,
    "[handlebars]": {
        "editor.formatOnSave": false
    },
    "tslint.autoFixOnSave": true
```

2. Install the next extensions to VScode:

- Prettier - Code formatter
- TSLint

3. Change the linting rules inside tslint.json and update the same file for API project

### Compilation

- `npm run build`

### Server Connection

- The BE creates `env-config.js` on the server startup from the server-side environment variables. It contains `API_URL` and `PORT` variables. `API_URL` is needed to connect with the server API, for example for authentication.
- FE app reads those values using `window._env_.API_URL` in `environment.prod.ts`.
- `env.sh` script is used to copy `API_URL` and `PORT` environment variables to `env-config.js` file saved in `/dist/angular-starter/browser`
- When building the app to run locally use `npm run build-and-serve-local` which builds application, adds example environment variables, uses `env.sh` script to create `env-config.js` and serves the application

### Production

- `npm run serve`
- in your browser [http://localhost:4000](http://localhost:4000)

### Prototype Bootstrap

- `change directory` cd ui
- launch html pages in your browser

## Lighthouse Audit

<img src="https://api.ganatan.com/articles/img/search-engine-optimization-avec-angular-lighthouse-after.png"/>

## Developer role

In order to show Dev Tools panel in application:

- open app in `Google Chrome`
- open browser's `dev tools` (F12 or fn+F12)
- open `Sources` tab, choose `Snippets` tab on the left side
- create new snippet with code:

```
var connection = indexedDB.open('keyval-store', 1);
connection.onsuccess = (e) => {
    console.log('connected to indexedDB')
    const database = e.target.result;
    const transaction = database.transaction(['keyval'], 'readwrite');
    const objectStore = transaction.objectStore('keyval');
    const request = objectStore.add(true, 'DEVELOPER_ROLE')
    request.onsuccess = (e2) => {
        console.log('added DEVELOPER_ROLE')
    }
}
```

- run snippet with the button in the bottom-right corner
- check in Application tab in `Google Chrome`'s `dev tools` tab, in Storage/IndexedDB/keyval-store.../keyval if there is an entry 'DEVELOPER_ROLE' with value `true` (use refresh button to reload table).
- refresh page
- remove this entry if you want hide dev-tools panel in the application
