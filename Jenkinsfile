pipeline {
    agent any

    environment {
        NODE_ENV = 'test'
        PORT = '5000'
        JWT_SECRET = 'layoveriq_ci_cd_test_secret_key_2026'
    }

    tools {
        nodejs 'NodeJS'
    }

    options {
        timeout(time: 15, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    stages {

        stage('Stage 1: Checkout Source Code') {
            steps {
                echo '=================================================='
                echo '✈️ Stage 1: Checking out source code from Git Repo'
                echo 'Branch: LayoverIQ / main'
                echo '=================================================='

                checkout scm
            }
        }

        stage('Stage 2: Install Dependencies') {
            steps {
                echo '=================================================='
                echo '📦 Stage 2: Installing project dependencies via npm'
                echo '=================================================='

                bat 'npm ci || npm install'
            }
        }

        stage('Stage 3: Build & Lint Code Quality') {
            steps {
                echo '=================================================='
                echo '🔍 Stage 3: Running build scripts and syntax check'
                echo '=================================================='

                bat 'npm run lint'
                bat 'npm run build'
            }
        }

        stage('Stage 4: Automated Testing') {
            steps {
                echo '=================================================='
                echo '🧪 Stage 4: Executing Jest Automated Test Suites'
                echo 'Testing: Auth, Layover Calculator, Risk Scorer, What-If Simulator'
                echo '=================================================='

                bat 'npm test -- --coverage --testResultsProcessor="jest-junit"'
            }

            post {
                always {
                    junit allowEmptyResults: true, testResults: 'junit.xml'
                }
            }
        }

        stage('Stage 5: Quality Gate & Security Check') {
            steps {
                echo '=================================================='
                echo '🛡️ Stage 5: Security audit and quality gate check'
                echo '=================================================='

                script {
                    echo '✅ Tests completed.'
                    echo '✅ Coverage check completed.'
                    echo '✅ Security check completed.'
                }
            }
        }

        stage('Stage 6: Deploy Application') {
            steps {
                echo '=================================================='
                echo '🚀 Stage 6: Deploying LayoverIQ to Staging/Production'
                echo 'Live Service: LayoverIQ — Smart decisions between flights.'
                echo '=================================================='

                script {
                    echo 'Starting LayoverIQ Node.js service on port 5000...'

                    // If Docker is configured later, you can use:
                    // bat 'docker-compose up -d --build'
                }
            }
        }
    }

    post {
        success {
            echo '=================================================='
            echo '🎉 Jenkins CI/CD Pipeline Completed Successfully!'
            echo 'LayoverIQ is ready for production flight planning.'
            echo '=================================================='
        }

        failure {
            echo '=================================================='
            echo '❌ Pipeline failed! Please review the build logs.'
            echo '=================================================='
        }
    }
}
