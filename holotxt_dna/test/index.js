const path = require('path')
const tape = require('tape')

const { Orchestrator, Config, tapeExecutor, localOnly, callSync, combine } = require('@holochain/tryorama')

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.error('got unhandledRejection:', error);
});

const orchestrator = new Orchestrator({
  middleware: combine(tapeExecutor(require('tape')), localOnly, callSync),
  waiter: {
    softTimeout: 10000,
    hardTimeout: 20000,
  },
})

//require('./standard')(orchestrator.registerScenario)
require('./versions')(orchestrator.registerScenario)

orchestrator.run()
