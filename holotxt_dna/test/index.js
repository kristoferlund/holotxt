/// NB: The try-o-rama config patterns are still not quite stabilized.
/// See the try-o-rama README [https://github.com/holochain/try-o-rama]
/// for a potentially more accurate example

const path = require('path')
const tape = require('tape')

const { Orchestrator, Config, tapeExecutor, singleConductor, combine } = require('@holochain/try-o-rama')

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.error('got unhandledRejection:', error);
});

const dnaPath = path.join(__dirname, "../dist/holotxt_dna.dna.json")

const orchestrator = new Orchestrator({
  middleware: combine(
    // squash all instances from all conductors down into a single conductor,
    // for in-memory testing purposes.
    // Remove this middleware for other "real" network types which can actually
    // send messages across conductors
    singleConductor,

    // use the tape harness to run the tests, injects the tape API into each scenario
    // as the second argument
    tapeExecutor(require('tape'))
  ),

  globalConfig: {
    logger: false,
    //network: 'memory',  // must use singleConductor middleware if using in-memory network
    network: {
      type: 'sim2h',
      sim2h_url: 'wss://localhost:9000',
    },
  },

  // the following are optional:

  waiter: {
    softTimeout: 5000,
    hardTimeout: 10000,
  },
})

const config = {
  instances: {
    holotxtInstance: Config.dna(dnaPath, 'holotxt_text')
  }
}

orchestrator.registerScenario('Test Holo.txt', async (s, t) => {
  const { alice, bob } = await s.players({ alice: config, bob: config }, true);

  let result;

  // Alice - get agent id
  result = await alice.call('holotxtInstance', "txt", "get_agent_id", {});
  t.ok(result.Ok);
  const alice_agent_id = result.Ok;

  // Bob - get agent id
  result = await bob.call('holotxtInstance', "txt", "get_agent_id", {});
  t.ok(result.Ok);
  const bob_agent_id = result.Ok;

  // Alice - create text 1

  result = await alice.call('holotxtInstance', "txt", "create_text", {
    "name": "text 1",
    "contents": "contents 1",
    "timestamp": new Date().getTime()
  });
  t.ok(result.Ok);
  const alice_text_address_1 = result.Ok;

  // Alice - create text 2

  result = await alice.call('holotxtInstance', "txt", "create_text", {
    "name": "text 2",
    "contents": "contents 2",
    "timestamp": new Date().getTime()
  });
  t.ok(result.Ok);

  // Wait

  await s.consistency()

  // Alice - save new version of text 1

  result = await alice.call('holotxtInstance', "txt", "save_text", {
    "text_address": alice_text_address_1,
    "name": "text 1 - version 2",
    "contents": "contents 1 - version 2",
    "timestamp": new Date().getTime()
  });
  t.ok(result.Ok);
  const alice_text_address_1_1 = result.Ok;

  // Wait

  await s.consistency()

  // Alice - save new version AGAIN of text 1

  result = await alice.call('holotxtInstance', "txt", "save_text", {
    "text_address": alice_text_address_1,
    "name": "text 1 - version 3",
    "contents": "contents 1 - version 3",
    "timestamp": new Date().getTime()
  });
  t.ok(result.Ok);
  const alice_text_address_1_2 = result.Ok;

  // Wait

  await s.consistency()

  // Alice - get text version 1

  result = await alice.call('holotxtInstance', "txt", "get_text", {
    "text_address": alice_text_address_1
  });
  t.ok(result.Ok);

  // Alice - get text version 1.2

  result = await alice.call('holotxtInstance', "txt", "get_text", {
    "text_address": alice_text_address_1_2
  });
  t.ok(result.Ok);

  // Alice - list texts

  result = await alice.call('holotxtInstance', "txt", "list_texts", {
    "agent_address": alice_agent_id
  });
  t.ok(result.Ok);
  t.equal(result.Ok.links.length, 2)

  // Bob - get Alice text 1

  result = await bob.call('holotxtInstance', 'txt', 'get_text', {
    'text_address': alice_text_address_1
  });
  t.ok(result.Ok);

  // Bob - remote save Alice text 1.1

  result = await bob.call('holotxtInstance', "txt", "remote_save_text", {
    "agent_address": alice_agent_id,
    "text_address": alice_text_address_1,
    "name": "Bob's edited the filename",
    "contents": "Bob setting the standard",
    "timestamp": new Date().getTime()
  });

  t.ok(result.Ok);

  // Wait

  await s.consistency()

  // Alice - get text version 1

  result = await alice.call('holotxtInstance', "txt", "get_text", {
    "text_address": alice_text_address_1
  });
  t.ok(result.Ok);

})


orchestrator.run()
