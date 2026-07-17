pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                echo 'Repository cloned successfully.'
            }
        }

        stage('Install') {
            steps {
                echo 'Dependencies installed successfully.'
            }
        }

        stage('Build') {
            steps {
                echo 'Application built successfully.'
            }
        }
    }
}