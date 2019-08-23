FROM alpine/helm:2.14.0
RUN apk add --no-cache jq curl bash nodejs && helm init --client-only
COPY . /usr/src/
ENTRYPOINT ["node", "/usr/src/index.js"]
