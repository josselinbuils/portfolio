FROM node:18

COPY . portfolio

WORKDIR portfolio

RUN git clone --bare https://github.com/josselinbuils/portfolio.git .git && \
    git config --local --bool core.bare false && \
    git reset HEAD -- . && \
    yarn install --emoji --frozen-lockfile --no-progress && \
    yarn build

CMD ["yarn", "start"]
