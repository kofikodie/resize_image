## How it works
The backend API exposes 3 endpoints:
1. POST /upload - upload one or images to a temporary S3 bucket and send a message to the SQS queue with the image key and a worker job consumes the message search for the image in the temporary S3 bucket resize it and move it to the permanent S3 bucket. The worker job is built using node-cron and runs every 10 seconds.
2. GET /download - download an image from the permanent S3 bucket given the image key
3. GET /health - returns 200 if the service is up and running
## Getting started
To get started, you need to:

 - Create your own docker-compose.override.yml file by
    ```bash
    cp docker-compose.override.yml.dist docker-compose.override.yml
    ```

 - Create an env file to store your express port and the redis and mongodb credentials.
    ```bash
    cp .env.dist .env
    ```

 - Run the following command to build the project:
   ```bash
   docker compose build 
   ```

 - Build the dependencies needed for the project:
   ```bash
   docker compose run --rm app npm install
   ```

 - Run the project:
   ```bash
   docker compose up -d
   ```

## Tests
To run the tests, you need to:
```bash
docker compose run --rm app npm test
```

## Manual testing
For manual testing, you can use the postman collection in the project root folder postman
