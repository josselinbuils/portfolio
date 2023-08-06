FROM node:18

COPY . portfolio
COPY .git portfolio/.git

WORKDIR portfolio

RUN yarn install --emoji --frozen-lockfile --no-progress && \
    yarn build

CMD ["yarn", "start"]
