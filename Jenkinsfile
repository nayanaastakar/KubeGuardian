pipeline {
    agent {
        docker {
            image 'node:20'
        }
    }

    stages {
        stage('Install') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }
    }
}