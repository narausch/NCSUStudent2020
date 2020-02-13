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
    }

    stage('Report') {
      steps {
        cobertura(coberturaReportFile: 'coverage/cobertura-coverage.xml', lineCoverageTargets: '70')
      }
    }

  }
}