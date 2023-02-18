FROM alpine:3.15

ENV BASE_URL="https://get.helm.sh"

ENV HELM_2_FILE="helm-v2.17.0-linux-amd64.tar.gz"
ENV HELM_3_FILE="helm-v3.8.0-linux-amd64.tar.gz"

# Install basic linux tools
RUN apk add --no-cache ca-certificates jq curl bash

# Install node and deps
RUN apk add --no-cache nodejs

# Install Aws CLI
RUN apk add --no-cache aws-cli

# Install Python3
RUN apk add --no-cache python3 py3-pip

# Install Python deps
RUN pip3 install --upgrade pip

# Install helm version 2
RUN curl -L ${BASE_URL}/${HELM_2_FILE} |tar xvz && \
    mv linux-amd64/helm /usr/bin/helm && \
    chmod +x /usr/bin/helm && \
    rm -rf linux-amd64

# Install helm version 3:
RUN curl -L ${BASE_URL}/${HELM_3_FILE} |tar xvz && \
    mv linux-amd64/helm /usr/bin/helm3 && \
    chmod +x /usr/bin/helm3 && \
    rm -rf linux-amd64

# Init version 2 helm:
RUN helm init --client-only

# Setup Python path variable
ENV PYTHONPATH "/usr/lib/python3.8/site-packages/"

# Copy node_modules and charts to src
COPY . /usr/src/

ENTRYPOINT ["node", "/usr/src/index.js"]