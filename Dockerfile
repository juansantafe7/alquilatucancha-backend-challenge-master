###################
# BUILD FOR LOCAL DEVELOPMENT
###################

<<<<<<< HEAD
FROM node:18.20.5-alpine AS development
=======
FROM node:16.17.0-alpine AS development
>>>>>>> upstream/main

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

<<<<<<< HEAD
RUN npm install -g @nestjs/cli

RUN yarn install
=======
RUN yarn
>>>>>>> upstream/main

COPY --chown=node:node . .

USER node

<<<<<<< HEAD
CMD ["yarn", "start:dev"]

=======
>>>>>>> upstream/main
###################
# BUILD FOR PRODUCTION
###################

<<<<<<< HEAD
FROM node:18.20.5-alpine AS build
=======
FROM node:16.17.0-alpine AS build
>>>>>>> upstream/main

WORKDIR /usr/src/app

COPY --chown=node:node package.json yarn.lock ./

<<<<<<< HEAD
# In order to run `yarn build` we need access to the Nest CLI.
# The Nest CLI is a dev dependency,
# In the previous development stage we ran `yarn` which installed all dependencies.
# So we can copy over the node_modules directory from the development image into this build image.
=======
# Copiar los node_modules de la etapa de desarrollo
>>>>>>> upstream/main
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN yarn build

ENV NODE_ENV production

RUN yarn --production

USER node

###################
# PRODUCTION
###################

<<<<<<< HEAD
FROM node:18.20.5-alpine AS production
=======
FROM node:16.17.0-alpine AS production

WORKDIR /usr/src/app
>>>>>>> upstream/main

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

<<<<<<< HEAD
CMD [ "node", "dist/main.js" ]
=======
CMD [ "node", "dist/main.js" ]
>>>>>>> upstream/main
