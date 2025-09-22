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
                sh 'CI=false npm run build'
            }
        }
        
        stage('Deploy to Nginx') {
    steps {
        // This 'sshAgent' block loads your key from Jenkins Credentials
        sshAgent(credentials: ['nginx-deploy-key']) {
            echo 'Deploying new build to Nginx server...'
            // This command will now use the loaded key for authentication
            sh 'scp -o StrictHostKeyChecking=no -r build/* ubuntu@13.62.72.157:/var/www/flexwrk/'
        }
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