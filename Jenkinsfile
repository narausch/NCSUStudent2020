pipeline {
  agent any
  stages {
    stage('startup') {
      steps {
        sh 'npm install'
      }
    }

    stage('test') {
      steps {
        sh 'npm run coverage'
      }
      post {
        always {
          cobertura(coberturaReportFile: 'output/coverage/cobertura-coverage.xml', enableNewApi: true, lineCoverageTargets: '70')
          junit 'output/junit.xml'
        }
      }
    }

  }
}