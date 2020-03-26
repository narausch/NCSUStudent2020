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

    stage('deploy') {
      when {
        expression {
          currentBuild.result == null || currentBuild.result == 'SUCCESS'
        }
      }
      steps {
        sh 'npm run build'
        sh 'env'     
        sh 'cd dist; SHORTREV=`git rev-parse --short HEAD`;VERSION=$(npm run version --silent);zip FlowDiff_${VERSION}_${SHORTREV}.zip *'

        archiveArtifacts artifacts: 'dist/*.zip', fingerprint: true
      }
    }
  }
}