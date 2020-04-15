const { config } = require('./config')

module.exports = scenario => {
  scenario('standard', async (s, t) => {

    // const { alice, bob } = await s.players({ alice: config, bob: config }, true);
    const { alice } = await s.players({ alice: config }, true);

    let result;

    // Alice - get agent id
    result = await alice.call('app', "txt", "get_agent_id", {});
    t.ok(result.Ok);
    const alice_agent_id = result.Ok;

    // // Bob - get agent id
    // result = await bob.call('app', "txt", "get_agent_id", {});
    // t.ok(result.Ok);
    // const bob_agent_id = result.Ok;

    // Alice - create text 1

    result = await alice.call('app', "txt", "create_text", {
      "name": "text 1",
      "contents": "contents 1",
      "timestamp": new Date().getTime()
    });
    t.ok(result.Ok);
    const alice_text_address_1 = result.Ok;

    // Alice - create text 2

    result = await alice.call('app', "txt", "create_text", {
      "name": "text 2",
      "contents": "contents 2",
      "timestamp": new Date().getTime()
    });
    t.ok(result.Ok);

    // Wait

    await s.consistency()

    // Alice - list texts

    result = await alice.call('app', "txt", "list_texts", {
      "agent_address": alice_agent_id
    });
    t.ok(result.Ok);
    t.equal(result.Ok.links.length, 2)

    // // Alice - save new version of text 1

    // result = await alice.call('app', "txt", "save_text", {
    //   "text_address": alice_text_address_1,
    //   "name": "text 1 - version 2",
    //   "contents": "contents 1 - version 2",
    //   "timestamp": new Date().getTime()
    // });
    // t.ok(result.Ok);
    // const alice_text_address_1_1 = result.Ok;

    // // Wait

    // await s.consistency()

    // // Alice - save new version AGAIN of text 1

    // result = await alice.call('app', "txt", "save_text", {
    //   "text_address": alice_text_address_1,
    //   "name": "text 1 - version 3",
    //   "contents": "contents 1 - version 3",
    //   "timestamp": new Date().getTime()
    // });
    // t.ok(result.Ok);
    // const alice_text_address_1_2 = result.Ok;

    // // Wait

    // await s.consistency()

    // // Alice - get text version 1

    // result = await alice.call('app', "txt", "get_text", {
    //   "text_address": alice_text_address_1
    // });
    // t.ok(result.Ok);

    // // Alice - get text version 1.2

    // result = await alice.call('app', "txt", "get_text", {
    //   "text_address": alice_text_address_1_2
    // });
    // t.ok(result.Ok);

    // // Bob - get Alice text 1

    // result = await bob.call('app', 'txt', 'get_text', {
    //   'text_address': alice_text_address_1
    // });
    // t.ok(result.Ok);

    // // Bob - remote save Alice text 1.1

    // result = await bob.call('app', "txt", "remote_save_text", {
    //   "agent_address": alice_agent_id,
    //   "text_address": alice_text_address_1,
    //   "name": "Bob's edited the filename",
    //   "contents": "Bob setting the standard",
    //   "timestamp": new Date().getTime()
    // });

    // t.ok(result.Ok);

    // // Wait

    // await s.consistency()

    // // Alice - get text version 1

    // result = await alice.call('app', "txt", "get_text", {
    //   "text_address": alice_text_address_1
    // });
    // t.ok(result.Ok);

  })
}
