FROM node
ENV NODE_ENV 'production'
ADD ./app/package.json /tmp/package.json
ADD ./README.md /tmp/README.md
RUN cd /tmp && npm install && mv /tmp/node_modules /node_modules
RUN npm install -g nodemon
ADD ./app /code
ENTRYPOINT ["/code/app.js"]
CMD ["runserver"]
