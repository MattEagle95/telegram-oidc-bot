# Telegram example bot
An example of a Telegram Bot using Authentication with OpenID Connect and PrismaJS.

![Build](https://github.com/matteagle95/telegram-oidc-bot/actions/workflows/ci.yml/badge.svg)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)

## Features
- Telegram Chat Bot
-- Authentication (OIDC)
-- Commands
-- Scheduled Commands
- REST-API
- Database (PrismaJS)

## Installation
### Local
```bash
  npm install
  npm start
```

### Docker
```bash
  docker run telegram-oidc-bot
```

### Docker compose
```
version: "3.9"

services:
  telegramBot:
    container_name: "telegram-bot"
    build: .
    restart: always
    healthcheck:
      test: curl --fail http://localhost:3000 || exit 1
      interval: 60s
      timeout: 5s
      retries: 3
    ports:
      - "3000:3000"
    volumes:
      - ./data:/data

volumes:
  data: {}
```

```bash
  docker compose up
```
    
## Environment Variables
To run this project, you will need to add the following environment variables to your .env file

```bash
SERVER_URL="http://localhost:3000" # the url of this bot
SERVER_PORT="3000" # the port of this bot
DATABASE_URL="file:./dev.db"
BOT_TOKEN="6141918853:AAHoG1ImQERz1Rn2dtnalGB5jryHZdr_-X8"
OIDC_ISSUER="https://auth.amalotia.com/realms/master"
OIDC_CLIENT_ID="telegram"
OIDC_CLIENT_SECRET="1Us3DgOl9H47L2n7a6wtR0AOMOPs3tKM"
```

## Development
Clone the project

```bash
  git clone https://link-to-project
```

Go to the project directory

```bash
  cd telegram-oidc-bot
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```

## License
[MIT](https://choosealicense.com/licenses/mit/)