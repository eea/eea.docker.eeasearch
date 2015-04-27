# EEA Search Node.js application + Docker env

## Development
1. Change code
2. If you changed ```Dockerfile``` or ```app/package.json``` then ```docker-compose build```
3. ```docker-compose up```
4. Go to http://localhost:3000
5. Before pushing to master make sure that ```./smoketest.sh``` passes

If you want to check that the image is built correctly, please comment out
the ```volumes```, ```entrypoint``` and ```command``` entries in ```docker-compose.yml```

## Production
1. ```docker pull eeacms/eeasearch```
2. Use any orchestration solution and make sure that the container
   can ping the Elastic backend

## No Docker Development
1. ```cd app```
2. ```npm install```
3. Set ```elastic_*``` env variables
4. ```./app.js runserver```
5. Go to http://localhost:3000
  
## Docker usage

Basic usage of the image is given by the following pattern:

```
docker-compose --rm run app $command
```
or
```
docker run -e elastic_host=$YOUR_ELASTIC_HOST run eeacms/eeasearch $command
```

To see the available commands run:
```
docker-compose --rm run app help
```

Note that any index creation commands require rights on the set elastic_backend

For more information about the settings.yml file, please see https://github.com/eea/eea.searchserver.js/blob/master/README.md

## Environment variables

- NODE_ENV: 'production' or 'dev'. Depending on this, the container will log
  only errors in Apache format for 'production' and all access logs for 'dev'.
  __The image is built with NODE_ENV=production.__
- SYNC_CRONTAB: A valid crontab line (e.g. * * * * *) for scheduling sync jobs.
  If not set, the app will never schedule sync jobs.
  __In the image this variable is not set.__
