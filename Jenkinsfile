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
          cobertura(coberturaReportFile: 'coverage/cobertura-coverage.xml', enableNewApi: true, lineCoverageTargets: '75, 65, 55')
          junit 'coverage/junit.xml'
        }
      }
    }

  }
}