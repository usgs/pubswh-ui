# Pubs Warehouse Compiled Static Assets

This project includes compiled assets for the USGS Pubs Warehouse. The assets
produced by this project are dependencies of the [Flask server](../server).

## Install dependencies

Javascript and LESS assets are built with Node.js v8.11.2. Usage of
[nvm](https://github.com/creationix/nvm) is a convenient way to use a specific
version of Node.js:

```bash
nvm use v8.11.2
```

Node.js dependencies are installed via:

```bash
npm install
```

... and Bower dependencies are installed via:

```bash
npx bower install
```

## Run a development server

Run the node.js development server at
[http://localhost:9000](http://localhost:9000):

```bash
npm run watch
```

## Test the production static assets build locally

To build the complete production package, built to `./dist`:

```bash
npm run build
```

Rather than using the `watch` task, you can serve the manually built assets.
To locally serve the production build without recompiling on filesystem
changes:

```bash
npm run serve:static
```

## Running tests

To run tests in Chrome via Karma, these are equivalent:

```bash
npm test
npm run test
```

Or to run directly with Karma:

```bash
npx karma start tests/js/manager/karma.conf.js
npx karma start tests/js/metrics/karma.conf.js
npx karma start tests/js/pubswh/karma.conf.js
```

Use --no-single-run option to leave the tests running. If you use this option you can
then go to localhost:9876 in the browser where you want to run the tests. This will have to be altered for Windows users.
This will automatically open the Firefox browser, but any browser can be used to run the tests This is helpful when writing/debugging tests
as the tests will automatically be rerun in whatever browser you are running tests in.
