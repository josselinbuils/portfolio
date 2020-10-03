FROM node:14

COPY . portfolio

WORKDIR portfolio

RUN yarn install --frozen-lockfile && \
    yarn build && \
    yarn install --production --frozen-lockfile

CMD ["yarn", "start"]
