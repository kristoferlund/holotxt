# __holo.txt

Proof of concept [Holochain](https://holochain.org) app showcasing simple collaborative notes editing. Makes use of the <a href='https://github.com/kristoferlund/react-holochain-hook'>useHolochain</a> React hook to simplify UI communication with Holochain, <a href='https://www.slatejs.org/'>Slate</a> for editing and <a href='https://yjs.dev/'>Yjs</a> for realtime sync between clients.

![image](https://user-images.githubusercontent.com/9698363/71314686-61cb0c00-244d-11ea-9429-2dd0e7c7d701.png)

## Prerequisites 

Holochain and nix-shell ([Installation guide](https://developer.holochain.org/docs/install/)).

## Two agent setup

Install dependecies:
```
cd holotxt_ui
yarn
```

Terminal 1, start networking server:

```
cd holotxt_dna
nix-shell https://holochain.love
sim2h_server -p 9000
```

Terminal 2, first conductor (Alice):

```
cd holotxt_dna
nix-shell https://holochain.love
holochain -c conductor-config-alice.toml
```

Terminal 3, second conductor (Bob):

```
cd holotxt_dna
nix-shell https://holochain.love
holochain -c conductor-config-bob.toml
```

Terminal 4, first client (Alice)

```
cd holotxt_ui
npm run start:alice
```

Terminal 5, second client (Bob)

```
cd holotxt_ui
npm run start:bob
```

## Contributing

Yes, please! Raise an issue or post a pull request. 

## TODO

- Test hApp bundle with Holoscape
- Add to Holochain temp hApp store

## License

MIT
