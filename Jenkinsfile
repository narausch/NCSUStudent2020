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
        sh 'cd dist'
        sh 'SHORTREV=`git rev-parse --short HEAD`'
        sh 'VERSION=$(npm run version --silent)'
        sh 'zip FlowDiff_${VERSION}_${SHORTREV}.zip *'
        sh 'cd ../'

        archiveArtifacts artifacts: 'dist/*.zip', fingerprint: true
      }
    }
  }
}