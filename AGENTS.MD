This is a Nuxt 4 project. This is built for a workshop at VueConf for users to implement AI features into different aspects of the application.

We want to use the backend-for-frontend pattern, so we should have server routes for each page that needs to load.

For example, the front-end route /dashboard should have a corresponding folder of server routes /api/app/dashboard/ that the front end can call to get data for the dashboard page. There may be multiple endpoints in that folder depending on what the front-end needs.

The front end is built with Vue.js and uses the PrimeVue UI library. Components and front end routes are defined in the `app` directory.

PrimeVue includes tailwind classes for styling which handle both light and dark mode. We should use these classes when we can:

primary-[50-950]	Primary color palette.
surface-[0-950]	Surface color palette.
primary	Default primary color.
primary-contrast	Default primary contrast color.
primary-emphasis	Default primary emphasis color.
border-surface	Content border color.
bg-emphasis	Emphasis background e.g. hovered element.
bg-highlight	Highlight background.
bg-highlight-emphasis	Highlight background with emphasis.
rounded-border	Border radius.
text-color	Text color with emphasis.
text-color-emphasis	Default primary emphasis color.
text-muted-color	Secondary text color.
text-muted-color-emphasis

Use Vasta for making database queries. Documentation can be found at https://vastajs.com/getting-started/introduction if necessary. There should be a model for each table in the database. Models are automatically imported by Nuxt, so we don't need imports for these when working in server-side code.

When modifying a table we should update the migration which is creating that table rather than making new migraitons. This is because we want to keep the number of migrations low for the workshop. We'll rebuild and reseed the database after each change to the migrations.

Use Zod for validating data in the server routes. Documentation can be found at https://zod.dev/ if necessary.
Validate in this style:

```ts
const bodySchema = z.object({
    email: z.email(),
    password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
    const { email, password } = await readValidatedBody(event, bodySchema.parse);
    // continue with the rest of the function

});
```

use `getValidatedRouterParams` and  `getValidatedQuery` for validating route and query parameters in a similar way. These are auto-imported as part of Nuxt and h3. The second argument to these functions should be the `parse` method of the Zod schema, not the schema itself.
Put the schema definitions before the `defineEventHandler` and use `const` to define them.

The server-side logic is implemented in the `server` directory.
Nuxt automatically types the data returned from `useFetch` and calling our server. We shouldn't manually define the types for these calls.

Dates should be formatted using `dayjs`. Documentation can be found at https://day.js.org/.

VueUse is also available for use in the front-end and server-side. Documentation can be found at https://vueuse.org/. We can add more VueUse packages if necessary.