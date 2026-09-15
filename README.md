# TaskFlow

TaskFlow is a production-style containerized task management application designed to demonstrate AWS, Docker, Linux, Git, GitHub, networking, CI/CD, monitoring, and security concepts.

## Current Architecture

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- API: REST
- Current storage: In-memory
- Future storage: Amazon DynamoDB

## Project Goals

- Containerize frontend and backend with Docker
- Deploy application inside a custom AWS VPC
- Use an Application Load Balancer
- Use EC2 Auto Scaling
- Store Docker images in Amazon ECR
- Implement CI/CD with GitHub Actions
- Authenticate GitHub to AWS using OIDC
- Monitor the application using Amazon CloudWatch