FROM node:10
COPY . portfolio-react
WORKDIR portfolio-react
RUN yarn install --production --frozen-lockfile && \
    yarn build
CMD ["yarn", "start"]
