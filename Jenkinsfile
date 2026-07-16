pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Pipeline') {
            steps {
                echo 'GitHub repository cloned successfully.'
                echo 'Jenkins Pipeline executed successfully.'
            }
        }
    }
}