# EEA Search Node.js application + Docker env

## Development
1. Change code
2. If you:
  1. Want to change something in [eea.searchserver.js](https://github.com/eea/eea.searchserver.js):
     ```./build_dev.sh $PATH_TO_EEA_SEARCHSERVER_JS_REPO```
  2. If you changed ```Dockerfile``` or ```app/package.json```:
     ```docker build -t eeacms/eeasearch:dev .``` and also make the changes in Dockerfile.dev.
  3. If you changed only something in './app' : go to step 3.
  4. If step 3 is still running and last build was made with ```./build_dev.sh```:
     go to step 4 because the server will automatically restart inside the container
  5. __Note:__ ```Dockerfile.dev``` builds only with ```./build_dev.sh``` because it temporarely adds
    eea.searchserver.js in the current directory.
3. ```docker-compose up```
4. Go to http://localhost:3000
5. Before pushing to master make sure that ```./test.sh``` passes.

If you want to check that the image is built correctly, please comment out
the ```volumes``` entry in ```docker-compose.yml```

## No Docker Development
1. ```cd app```
2. ```npm install```
3. Set ```elastic_*``` env variables
4. ```./app.js runserver```
5. Go to http://localhost:3000

## Production

### Deploy via Rancher

The application is available in the [EEA Rancher Catalog](https://github.com/eea/eea.rancher.catalog/tree/master/templates/elastic-app-eeasearch).

### Other

1. ```docker pull eeacms/eeasearch```
2. Use any orchestration solution and make sure that the container
   can ping the Elastic backend
3. Pass commands and env variables to the image as explained in the Docker Usage section


## Docker Usage

Basic usage of the image is given by the following pattern:

```
docker run -e elastic_host=$YOUR_ELASTIC_HOST run eeacms/eeasearch $command
```

To see the available commands run:
```
docker run -e elastic_host=$YOUR_ELASTIC_HOST run eeacms/eeasearch help
```

Available commands:
* create_index: create the index on elastic_host and start harvesting
* reindex : recrate the index on the elastic_host and start harvesting
* sync_index: sync the resources
* remove_data: remove the ES index of this app
* remove_river: stop the harvesting process by removing the river

Environment variables:
* elastic_index: the elasticsearch index id where to store the data. 
  * note the elastic index in app/config/settings.json takes precendence, so delete if you want the environment variable to work.
* elastic_host, elastic_port, elastic_path: the elasticsearch endpoint parameters
  the elasticsearch endpoint will be interpreted as such: `http://$elastic_host:$elastic_port$elastic_path`
 * by default, elastic_port is 9200
 * by default, elastic_path is /
* NODE_ENV: can be either ```dev``` or ```production```
 * `dev` will do a more verbose logging
 * `production` will log only erros in an APACHE format
  * Assuming that the app will be proxied in production, the proxy app should contain the access logs 
* SYNC_CRONTAB: A valid crontab line (e.g. * * * * *) for scheduling sync jobs.
  If not set, the app will never schedule sync jobs.
  __In the image this variable is not set.__

Note that any index creation commands require rights on the set elastic_backend

For more information about the settings.yml file, please see https://github.com/eea/eea.searchserver.js/blob/master/README.md

