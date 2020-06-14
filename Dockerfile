FROM node:14

COPY . portfolio-next

WORKDIR portfolio-next

RUN yarn install --production --frozen-lockfile && \
    yarn build

CMD ["yarn", "start"]
