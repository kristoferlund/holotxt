const { config } = require('./config')

module.exports = scenario => {
  scenario('repeat get_text should yield the same result', async (s, t) => {
    const { alice, bob } = await s.players({ alice: config, bob: config }, true);

    let result;

    // Alice - create text 1

    result = await alice.call('app', "txt", "create_text", {
      "name": "text 1",
      "contents": "contents 1",
      "timestamp": new Date().getTime()
    });
    t.ok(result.Ok);
    const alice_text_address_1 = result.Ok;

    // Wait

    await s.consistency()

    // Alice - save new version of text 1

    result = await alice.call('app', "txt", "save_text", {
      "text_address": alice_text_address_1,
      "name": "text 1 - version 2",
      "contents": "contents 1 - version 2",
      "timestamp": new Date().getTime()
    });
    t.ok(result.Ok);

    // Wait

    await s.consistency()

    // Alice - save new version of text 1

    result = await alice.call('app', "txt", "save_text", {
      "text_address": alice_text_address_1,
      "name": "text 1 - version 3",
      "contents": "contents 1 - version 3",
      "timestamp": new Date().getTime()
    });
    t.ok(result.Ok);

    // Wait

    await s.consistency()

    // Alice - save new version of text 1

    result = await alice.call('app', "txt", "save_text", {
      "text_address": alice_text_address_1,
      "name": "text 1 - version 4",
      "contents": "contents 1 - version 4",
      "timestamp": new Date().getTime()
    });
    t.ok(result.Ok);

    // Wait

    await s.consistency()

    // Bob - get Alice text 1

    result = await bob.call('app', 'txt', 'get_text', {
      'text_address': alice_text_address_1
    });
    t.ok(result.Ok);
    t.equal(result.Ok.name, "text 1 - version 4")

    // Again

    result = await bob.call('app', 'txt', 'get_text', {
      'text_address': alice_text_address_1
    });
    t.ok(result.Ok);
    t.equal(result.Ok.name, "text 1 - version 4")

    // Again

    result = await bob.call('app', 'txt', 'get_text', {
      'text_address': alice_text_address_1
    });
    t.ok(result.Ok);
    t.equal(result.Ok.name, "text 1 - version 4")

    // Again

    result = await bob.call('app', 'txt', 'get_text', {
      'text_address': alice_text_address_1
    });
    t.ok(result.Ok);
    t.equal(result.Ok.name, "text 1 - version 4")

    // Again

    result = await bob.call('app', 'txt', 'get_text', {
      'text_address': alice_text_address_1
    });
    t.ok(result.Ok);
    t.equal(result.Ok.name, "text 1 - version 4")

  })
}