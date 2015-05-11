# EEA Search Node.js application + Docker env

## Development
1. Change code
2. If you:
  1. Want to change something in [eea.searchserver.js](https://github.com/eea/eea.searchserver.js):
     ```./build_dev.sh $PATH_TO_EEA_SEARCHSERVER_JS_REPO```
  2. If you changed ```Dockerfile``` or ```app/package.json```:
     ```docker build -t eeacms/eeasearch .``` and also make the changes in Dockerfile.dev.
  3. If you changed only something in './app' and the last build was made with ```./build_dev.sh```:
     go to step 3.
  4. __Note:__ ```Dockerfile.dev``` builds only with ```./build_dev.sh``` because it temporarely adds
    eea.searchserver.js in the current directory.
3. ```docker-compose up```
4. Go to http://localhost:3000
5. Before pushing to master make sure that ```./test.sh``` passes

__Note:__ If you are only changing code in ```./app``` and the last build was made
using ```./build_dev.sh```, the server will automatically restart
so there's no need to restart/rebuild the container at every change in the code.

If you want to check that the image is built correctly, please comment out
the ```volumes``` entry in ```docker-compose.yml```

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
