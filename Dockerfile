FROM node:14

COPY . portfolio

WORKDIR portfolio

RUN yarn install --emoji --frozen-lockfile --no-progress && \
    yarn build && \
    yarn install --emoji --frozen-lockfile --no-progress --production

CMD ["yarn", "start"]
