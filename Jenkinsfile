pipeline {
    agent any // This pipeline can run on any available Jenkins agent
	tools {
        // This tells Jenkins to use the NodeJS tool named 'NodeJS-20'
        // and add it to the PATH for this pipeline.
        nodejs 'NodeJS-20' 
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
                echo 'Deploying new build to Nginx server...'
                // This command securely copies the build files to the Nginx web directory.
                // Replace user@your_nginx_server_ip with your server's credentials.
                sh 'rsync -avz --delete build/ root@51.21.230.152:/var/www/flexwrk/'
                sh 'scp -o StrictHostKeyChecking=no -r build/* root@51.21.230.152:/var/www/flexwrk/'
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
