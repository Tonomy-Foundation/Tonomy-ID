pipeline {
    agent {
        docker {
            image 'node:16.4.1'
            args '-v ./:/var/repo'
        }
    }
    stages {
        stage('Lint') {
            steps {
                cd /var/repo/Tonomy-ID
                npm i
                npm run lint
            }
        }
        stage('Test') {
            steps {
                cd /var/repo/Tonomy-ID
                npm test
            }
        }
    }
}