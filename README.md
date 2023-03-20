# Node.js coding challenge
Architecture: this project is built using docker-compose to run the backend API, the AWS S3 service and the AWS SQS service. The backend API is built using Express.js while the bucket storage and queue service is built using localstack.

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
   docker-compose build 
   ```

 - Build the dependencies needed for the project:
   ```bash
   docker-compose run --rm app npm install
   ```

 - Run the project:
   ```bash
   docker-compose up -d
   ```

## Deploying and Scaling
To ensure efficient deployment and scaling of this project, the recommended approach is to utilize AWS ECS for the backend API and a lambda for the worker job. AWS ECS is a reliable container orchestration service that allows for running and scaling containerized applications with ease. By deploying the backend API and the worker job as separate services in ECS, you can achieve optimal performance and scalability.

To deploy the backend API as a service, it's recommended to use two tasks. Additionally, an ALB can be deployed in front of the API to handle incoming requests. For enhanced security, a web application firewall can be added to protect against any possible exploits.

On the other hand, the worker can be deployed as a lambda function, using a cron job to trigger the processing of messages at regular intervals. To improve the efficiency of the worker job, a batch job can also be added to the lambda function to process multiple messages at once.

During development, localstack can be utilized to simulate the AWS services, namely S3 and SQS. This approach ensures that the project can be deployed to AWS using the same architecture.

S3 can automatically scale storage capacity, and request processing based on the application's needs, so it can handle any amount of data required by the project. Additionally, S3 can be configured to replicate data to multiple regions for improved resilience, and it can also be integrated with Amazon CloudFront for content delivery.

SQS is designed to be resilient, as it stores messages redundantly across multiple servers and data centers to ensure high availability and durability. It is also capable of automatically scaling to handle the increasing volume of messages and can be configured to have different message retention periods and delivery policies.

## Tests
To run the tests, you need to:
```bash
docker-compose run --rm app npm test
```

Missing tests:
1. The worker job is not tested via code. The worker job is tested manually by uploading an image to the temporary S3 bucket and checking if the image is resized and moved to the permanent S3 bucket.
2. The download endpoint is not tested via code. The download endpoint is tested manually by uploading an image to the temporary S3 bucket and checking if the image is resized and moved to the permanent S3 bucket.

The worker code can be abstracted into a separate module and tested using jest. Since there is direct dependency on the AWS SDK, the tests can be mocked using stub classes that implements the adapter interface. The stub classes can be used to simulate the AWS SDK behavior and test the worker job.

## Manual testing
For manual testing, you can use the postman collection in the project root folder postman
