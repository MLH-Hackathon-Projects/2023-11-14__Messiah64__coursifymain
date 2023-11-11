## Fly Setup

1. [Install `flyctl`](https://fly.io/docs/getting-started/installing-flyctl/)

2. Sign up and log in to Fly

```sh
flyctl auth signup
```

3. Setup Fly. It'll ask the following questions

```sh
flyctl launch

Would you like to copy its configuration to the new app? Yes(y)
Choose an app name (leaving blank will default to 'coursify') (leave blank)
App coursify already exists, do you want to launch into that app? Yes (y)
```

4. To actually deploy it, all you'll you need to do is run this:

```sh
npm run deploy
```

You can run `flyctl info` to get the url and ip address of your server.

Check out the [fly docs](https://fly.io/docs/getting-started/node/) for more information.
