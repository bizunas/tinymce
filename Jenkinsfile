def credentialsId = '8aa93893-84cc-45fc-a029-a42f21197bb3';

properties([
  disableConcurrentBuilds(),
  pipelineTriggers([
    upstream(threshold: 'SUCCESS', upstreamProjects:
      // This list should match package.json
      'katamari, sand'
    ),
    pollSCM('H 0 1 1 1')
  ])
])

// Script to use for pipeline
node ("primary") {

  stage ("Checkout SCM") {
    checkout scm
    sh "mkdir -p jenkins-plumbing"
    dir ("jenkins-plumbing") {
      git([branch: "master", url:'ssh://git@stash:7999/van/jenkins-plumbing.git', credentialsId: '8aa93893-84cc-45fc-a029-a42f21197bb3'])
    }
  }

  def extBedrock = load("jenkins-plumbing/bedrock-browsers.groovy")
  def runTests = extBedrock({ browser ->
    // Firefox was disabled before, and IE never passes unless watched
    def webdriverTests = (browser == "ie" || browser == "firefox") ? "" : " src/test/ts/webdriver"
    return "src/test/ts/atomic src/test/ts/browser" + webdriverTests
  })

  def runBuild = load("jenkins-plumbing/standard-build.groovy")
  runBuild(runTests)
}