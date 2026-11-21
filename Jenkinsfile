
pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'amirkhan1234/airbnb-app'
        APP_HOST = '172.31.13.180'
        APP_ENV_FILE = '/home/ubuntu/my-project/.env'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'GitHub se code checkout kar rahe hain'
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                echo 'Docker image build ho rahi hai'

                sh '''
                    docker build \
                    -t $DOCKER_IMAGE:$BUILD_NUMBER \
                    -t $DOCKER_IMAGE:latest .
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login \
                        -u "$DOCKER_USER" --password-stdin

                        docker push $DOCKER_IMAGE:$BUILD_NUMBER
                        docker push $DOCKER_IMAGE:latest

                        docker logout
                    '''
                }
            }
        }

        stage('Deploy to Application EC2') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'app-ec2-key',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {
                    sh '''
                        ssh -i "$SSH_KEY" \
                        -o StrictHostKeyChecking=no \
                        "$SSH_USER@$APP_HOST" \
                        "set -e;
                        test -f $APP_ENV_FILE;
                        sudo docker pull $DOCKER_IMAGE:$BUILD_NUMBER;
                        sudo docker rm -f airbnb-container || true;
                        sudo docker run -d \
                        --name airbnb-container \
                        --restart unless-stopped \
                        --env-file $APP_ENV_FILE \
                        -p 3000:3000 \
                        $DOCKER_IMAGE:$BUILD_NUMBER"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Airbnb application successfully deployed!'
        }

        failure {
            echo 'Pipeline failed. Console Output check karo.'
        }
    }
}
