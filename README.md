# Image Resizer Service

A microservice that handles image uploads, resizing, and storage using AWS services (S3 and SQS).

## Architecture

![Architecture Diagram](docs/architecture.png)

The service consists of three main components:

1. **Upload API**: Handles image uploads and stores them in a temporary S3 bucket
2. **Worker**: Processes images from the queue, resizes them, and moves them to permanent storage
3. **Download API**: Serves resized images from permanent storage

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/upload` | POST | Upload one or more images to temporary storage |
| `/download` | GET | Download a processed image by key |
| `/health` | GET | Service health check |

### How it Works

1. When an image is uploaded via `/upload`:
   - The image is stored in a temporary S3 bucket
   - A message is sent to SQS with the image details
   - A worker job (running every 10 seconds) processes the queue

2. The worker:
   - Retrieves images from the temporary bucket
   - Resizes them according to configuration
   - Moves them to permanent storage
   - Deletes the temporary files

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 16+ (for local development)
- AWS account (or localstack for development)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/your-username/image-resizer.git
cd image-resizer
```

2. Create configuration files:
```bash
cp docker-compose.override.yml.dist docker-compose.override.yml
cp .env.dist .env
```

3. Configure environment variables in `.env`:
```bash
cp .env.dist .env
```

4. Build and start the service:
```bash
docker compose build
docker compose run --rm app npm install
docker compose up -d
```

### Production Deployment

The service can be deployed to Kubernetes using ArgoCD:

1. Install ArgoCD:
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
```

2. Deploy the application:
```bash
kubectl apply -f k8s/application.yaml
```

See [Deployment Guide](docs/deployment.md) for detailed instructions.

## Development

### Project Structure
```
.
├── src/
│   ├── adapters/      # AWS service adapters
│   ├── controllers/   # API route handlers
│   ├── services/      # Business logic
│   └── workers/       # Background jobs
├── tests/            # Test files
├── charts/           # Helm charts
└── docs/            # Documentation
```

### Running Tests

```bash
# Unit tests
docker compose run --rm app npm test

# Integration tests
docker compose run --rm app npm run test:integration

# Coverage report
docker compose run --rm app npm run test:coverage
```

### Manual Testing

A Postman collection is provided in the `postman` directory for manual API testing.

## Monitoring

The service includes:
- Winston logging with JSON format
- Health check endpoint
- AWS CloudWatch metrics
- Kubernetes liveness/readiness probes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
