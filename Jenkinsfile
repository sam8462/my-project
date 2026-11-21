
pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'GitHub se code checkout kar rahe hain'
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Docker image build karenge'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo 'Docker Hub par image push karenge'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Application EC2 par deploy karenge'
            }
        }
    }
}
