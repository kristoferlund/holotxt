const path = require('path')
const { Config } = require('@holochain/tryorama')

const dnaPath = path.join(__dirname, '../dist/holotxt_dna.dna.json')
const dna = Config.dna(dnaPath, 'txt')

const network = {
  type: 'sim2h',
  sim2h_url: 'ws://localhost:9000'
}

const quietLoggerConfig = {
  type: 'debug',
  state_dump: false,
  rules: {
    rules: [{ exclude: true, pattern: '.*' }]
  }
}

const saneLoggerConfig = {
  type: 'debug',
  rules: {
    rules: [
      {
        exclude: true,
        pattern: '.*parity.*'
      },
      {
        exclude: true,
        pattern: '.*mio.*'
      },
      {
        exclude: true,
        pattern: '.*tokio.*'
      },
      {
        exclude: true,
        pattern: '.*hyper.*'
      },
      {
        exclude: true,
        pattern: '.*rusoto_core.*'
      },
      {
        exclude: true,
        pattern: '.*want.*'
      },
      {
        exclude: true,
        pattern: '.*rpc.*'
      }
    ]
  },
  state_dump: true,
}

const commonConfig = { quietLoggerConfig, network }

module.exports = {
  config: Config.gen({
    app: dna
  },
    commonConfig
  ),
}