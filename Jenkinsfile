pipeline {
    agent {
        docker {
            image 'node:16.4.1'
            args '-v ./:/var/repo'
        }
    }
    stages {
        stage('Build') {
            steps {
                cd /var/repo
                npm i
            }
        }
        stage('Lint') {
            steps {
                npm run lint
            }
        }
        stage('Test') {
            steps {
                npm test
            }
        }
    }
}