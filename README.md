## Test Stripe Webhooks locally

### Pull the Stripe CLI Docker image

With Docker installed(including enabling WSL), in the terminal, run:

```
docker pull stripe/stripe-cli:latest
```

### Start an interactive shell in the container

a shell inside the container so you can run multiple stripe commands in one session, override the entrypoint:

```
docker run --rm -it --entrypoint /bin/sh stripe/stripe-cli:latest
```

### Log in to Stripe (inside the shell)

```
stripe login
```

This opens a browser window asking you to authorize the CLI. After you click “Authorize,” return to the shell and you’ll see:

```
Done! The Stripe CLI is configured for Meal Plan Generator sandbox with account id acct_XX
```

### Listen for webhook events

Still inside that same shell:

```
stripe listen --forward-to host.docker.internal:8080/api/stripe/webhook
```

You will get webhook secret like this

```
Ready! You are using Stripe API Version [2025-05-28.basil]. Your webhook signing secret is whsec_XX
```
