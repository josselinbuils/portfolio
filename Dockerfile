FROM node:16.13

COPY . portfolio

WORKDIR portfolio

RUN yarn install --emoji --frozen-lockfile --no-progress && \
    yarn build

CMD ["yarn", "start"]
