# split-decision

This is a Next.js site for managing speedrun marathon event submissions. It does these things:

- Allow users to authenticate via Discord, list their availability, and submit games and categories to events currently accepting submissions.
- Allow users to specify their display name, email, pronouns, and whether or not they want to publicly display their submisisons.
- Allow admin users to add and customize events, including: start and end time, event submission period, maximum number of games and categories per game each user can submit, and genres accepted by the event.
- Allow editing of submissions during the event submission period.
- Display a public list of submissions.
- Optionally require membership in a Discord server to log in and submit to the event.

Feel free to use it for your event!

## Setup
When running locally, you can make a `.env` file at the root directory to store all of your environment variables. **Do not do this in production.**

Example:
```
DISCORD_CLIENT_ID=1234567890
DISCORD_CLIENT_SECRET=awjerio234aJba324542
DISCORD_BOT_TOKEN=bawerja234ja.segj98ioadgwer.aaOIJCAWERWERoawoeirjawoeraw3bAa
NEXTAUTH_SECRET=timeloss
DISCORD_SERVER_ID=0987654321
DATABASE_URL=postgresql://user:password@hostname:port/split-decision?schema=public
```

### Setting up the Discord application

`split-decision` uses Discord for authentication to avoid requiring users to make yet another account, and because I never want to be responsible with storing passwords ever in my life.

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
1. Create a new application and give it a name that makes sense.
1. Copy the application ID and assign it as the `DISCORD_CLIENT_ID` environment variable.
1. Go to the OAuth -> General page from the sidebar and generate a secret ID. Assign it as the `DISCORD_CLIENT_SECRET` environment variable.
1. Add a redirect to `https://YOUR_DOMAIN_HERE/api/auth/callback/discord`. (If running locally, add a redirect to `http://localhost:3000/api/auth/callback/discord`).
1. Go to the Bot page from the sidebar and add a bot to your application. Generate a token and assign it as the `DISCORD_BOT_TOKEN` environment variable.
1. Navigate to `https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID_HERE&permissions=0&scope=bot%20applications.commands` and add the bot to your server (note the `YOUR_CLIENT_ID_HERE` that you need to replace in the URL).

#### Enabling the Discord membership requirement

If the `DISCORD_SERVER_ID` environment variable is set, `split-decision` will not allow users to log in unless they are a member of your server. You can get the server ID by enabling Developer Mode in Discord, right-clicking your server
in the sidebar, and selecting "Copy ID".

### Setting up the database

By default, `split-decision` is configured to use PostgreSQL. Other connectors should work fine as long as they're supported by [Prisma](https://www.prisma.io/docs/concepts/database-connectors), but it's up to you to configure them if you don't want to use Postgres. 

This setup guide assumes you know how to set up a database in your environment. Once you have your database ready, assign the connection string to the `DATABASE_URL` environment variable.

**In development:** Run `npx prisma migrate dev`

**In production:** Run `npx prisma migrate deploy`

### Additional production configuration

When running `split-decision` in production, you need to set the `NEXTAUTH_URL` environment variable to your domain

```
NEXTAUTH_URL=https://submissions.mysite.com/
```

In local development, this environment variable is not required.

## Configuration

Various aspects of the site can be configured in the root-level `config.json` file. You can copy the provided `config-base.json` provided, rename it to `config.json`, and edit in your own values.

`heroImage` (string): The URL of the image to display on the home page. This dimensions of this image should be 600x400px.

`embedImage` (string): The URL of the image to display in embeds. The dimensions of this image should be 1200x630px.

`favicon` (string): The URL of the site favicon. This should be a square `.ico`.

`siteName` (string): The name of the site, as displayed in the navbar and embeds. I recommend something like "My Marathon Submissions".

`organizationName` (string): The name of your organization.

`siteDescription` (string): A short description of the site for use in embeds. I recommend something like "Event submissions for My Marathon Series".

`colors` (object): Various configurable hex codes. This is a nested object; the keys will be displayed in path syntax for simplicity, such that `a.b.c` represents this structure:

```json
{
  "a": {
    "b": {
      "c": "value"
    }
  }
}
```

_These are kind of a mess, sorry!_

`colors.primary` - The primary background color. This needs to be a dark color, as a lot of text is white. _(again, sorry that this configurability is a disaster ight now.)_

`colors.accents.control` - The color used for control elements, like toggles and some buttons.

`colors.accents.eventItem` - The color used the background of events in listings.

`colors.accents.separator` - The color used for form section separators. This is also sometimes used as a background color when alternating table rows.

`colors.accents.alert` - The background color of alerts. This should be some shade of blue for consistency with other elements that use this color.

`colors.accents.link` - The color for links. This should be some shade of blue for consistency with other elements that use this color.

`colors.accents.activeTimeslot` - The color used to show that a user has listed themselves as available during a timeslot.

`colors.accents.hover.control` - The background color used for control elements when they are hovered over or active.

`colors.text.primary` - The primary text color.

`colors.text.light` - A light text color for use on dark backgrounds.

`colors.text.dark` - A dark text color for use on light backgrounds.

`colors.error.background` - The background color of error alerts.

`colors.error.text` - The color of error description text.

`colors.error.dark.background` - The background color of "danger" buttons, such as those for deleting submissions.