pipeline {
    agent any // This pipeline can run on any available Jenkins agent
    tools{
        nodejs 'NodeJS-20' // Ensure Node.js is available
    }
    stages {
        stage('Build') {
            steps {
                echo 'Installing dependencies and building React app...'
                sh 'npm install'
                sh 'npm run build'
            }
        }
        
        stage('Deploy to Nginx') {
            steps {
                echo 'Deploying new build to Nginx server...'
                // This command securely copies the build files to the Nginx web directory.
                // Replace user@your_nginx_server_ip with your server's credentials.
                sh 'scp -r build/* ubuntu@13.62.72.157:/var/www/flexwrk/'
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful! 🎉'
        }
        failure {
            echo 'Deployment failed.'
        }
    }
}