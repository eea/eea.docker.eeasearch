FROM eeacms/node:v4.2.2-1.0
ENV NODE_ENV 'production'
ADD ./app/package.json /tmp/package.json
ADD ./README.md /tmp/README.md
RUN cd /tmp && npm install && mv /tmp/node_modules /node_modules
ADD ./app /code
VOLUME /code/app/config
USER node