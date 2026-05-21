# VueConf Workshop - Building (actually useful) AI Solutions

Hello! Welcome to the workshop!

This repository will be the base for the activities we'll be doing in class. It's a fairly simple Nuxt 4 application with a basic UI and some features which we'll be expanding.

Please clone this repository and follow the setup instructions here.

Completed activites are available in the `complete` branch, which you can check out at any time to see the finished code for each activity from the workshop.

## Prerequisites:

Please be sure to have the following apps and services configured and ready before the day of the workshop.

- [**Node 24**](https://nodejs.org/en/blog/release/v24.14.0) — We’ll be using the Node 24 for this project. Please have this downloaded and ready for use. [NVM](https://github.com/nvm-sh/nvm) is a good way to install and manage specific Node versions.
- [**pnpm**](https://pnpm.io/installation) — Node package manager. You should be able to run the `pnpm` command in your terminal.
- [**Google Gemini API key**](https://ai.google.dev/gemini-api/docs/quickstart) — Please follow the instructions to set up a Gemini API key. Be sure to configure billing with a valid credit card. We probably won’t have that much usage, but you want to make sure that you don’t get cut off in the middle of the workshop!
- [\*\*Project Repository](https://github.com/Smef/vueconf-workshop-2026) (Still being worked on! Sorry! I’ll try to have this public over the weekend)\*\* — Check out this repository and make sure that you can run it in your local environment. You may want to install the dependencies ahead of time with `pnpm install`.
- [**PostgreSQL**](https://www.postgresql.org/) — You’ll need a local PostgreSQL database running on your local machine for this workshop. Please be sure to have this installed and tested ahead of time. You may use whatever your preferred database utility is.
    - You can [install PostgresSQL directly](https://www.postgresql.org/download/), use the [official Docker image](https://hub.docker.com/_/postgres), or any other helpful app.
    - On Mac [DBngin](https://dbngin.com/) is a good app for running this.
- [**pgvector**](https://github.com/pgvector/pgvector) — We’ll use this Postgres extension for storing vector data. Be sure you can run `CREATE EXTENSION vector;` in a test Postgres database. You may need to install this extension separately, or it may be included in your Postgres platform, so please check and make sure you can activate it using the command here.
- **Code editor** — [VS Code](https://code.visualstudio.com/) is recommended, but you may use whatever you are most comfortable with. The project repository will include VS Code “recommended extensions” which will show up when you open the project in VS Code, but otherwise be sure you can easily work with Vue, Node, and Nuxt in your editor.
- **Database Viewer** — You should have some way to connect and view database data for diagnosis and review purposes. [TablePlus](https://tableplus.com/) is a good app for this, but there are also free [extensions for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-ossdata.vscode-pgsql) and Jetbrains products have a nice database manager already built-in.

## Setup Instructions

### Install Dependencies

This project uses `pnpm` as a pacakge manager. Install the dependencies with:

```bash
pnpm install
```

### Configure Environment Variables

Copy the `.env.example` file to `.env` and fill in the required environment variables. At minimum, you will need to fill in the database connection information and the Google Gemini API key.

```bash
cp .env.example .env
```

### Migrate the Database and run seeders

Run the following command to create the database tables and seed them with initial data:

```bash
pnpm run db:reset
```

This one command will reset the databse, run all migrations, and then run the seeders to populate the database with some initial data. You can run this command again at any time to reset the database to the initial state. This may be helpful during the workshop as new fields are added or data is modified.

### Run the Development Server

Start the Nuxt development server with:

```bash
pnpm run dev
```

This will start the server on `http://localhost:3000` by default. You should be able to open this URL in your browser and see the application running.

### Checking that everything is working

You should be able to open the site and see the Home page. Click on the "Test" link in the left-hand navigation menu to go to the Test page. This page will attempt to load some "Parent" records from the database and display them in a table. If you see the message "Connected — X Parent records loaded." (where X is a number), then everything is working correctly!

You should also see a chat box below the table. You can use this to send a message to Gemini and get a response back. Try sending a message to make sure that your Gemini API key is working correctly.

## Important Packages

The following are some of the key packages that we will be using in this project. You may want to familiarize yourself with these before the workshop or may want to refer to their documentation during the workshop.

- [**Nuxt 4**](https://nuxt.com/) - The main framework for our application. Nuxt is a powerful and flexible framework for building Vue applications, and it provides a lot of features out of the box that we will be using.
- [**Vasta**](https://vastajs.com/) - A **brand new** type-safe active-record ORM built on top of Kysely. Vasta provides a higher-level API for working with our database, including features like model definitions, relationships, and more.
- [**Kysely**](https://kysely.dev/) - A type-safe SQL query builder for TypeScript. Kysely allows for direct SQL queries
- [**Google Gemini API**](https://ai.google.dev/gemini-api/docs) - The API for interacting with Google's Gemini language model. We will use this to integrate AI capabilities into our application.
- [**Zod**](https://zod.dev/) - A schema validation library. We will use Zod to validate incoming requests.
- [**PrimeVue**](https://primevue.org/) - A UI component library for Vue. We will use this for building our user interface.
- [**Tailwind CSS**](https://tailwindcss.com/) - CSS framework for styling our application.
- [**VueUse**](https://vueuse.org/) - A collection of utility functions for Vue.
