# Polls

Polls is an on-chain voting system with secret votes. Unfortunately, the drawback of using public key cryptography is that the publisher of the poll can see the votes before anybody else can see them.

## The flow

* the owner of the poll publishes the poll with a unique id, name, list of options, and a public key
* the voters encrypt their votes and submit them
* the owner closes the poll by publishing a private key
* after that, the results are in and can be calculated inside of the smart contract

## Running the whole flow

### Identity service

In Google developer console:

* create a new app
* set `http://localhost:9000` as OAUTH2 domain and `http://localhost:9000/auth/google/callback` as callback URL.

```bash
cd identity
npm install
npm run migrate

# Set up google client and secret ID for webapp
export GOOGLE_CLIENT_ID= GOOGLE_CLIENT SECRET=

# Set Orbs key pair for the identity contract
export ORBS_PUBLIC_KEY=0xdAEa7036C70D5Ef02A8627eFFa9e4D40D77649ED325c6788B610E30974B81Bba
export ORBS_PRIVATE_KEY=0x63D0518f77499B2138833DAf248210d2018dA6F057c07c5846b7Ba6d20DE387FdAEa7036c70D5EF02A8627Effa9e4D40d77649Ed325C6788B610E30974B81bbA

npm run dev
```

### Polls service

```bash
# Set Orbs key pair for smart contract deployment
export ORBS_PUBLIC_KEY=0xdAEa7036C70D5Ef02A8627eFFa9e4D40D77649ED325c6788B610E30974B81Bba
export ORBS_PRIVATE_KEY=0x63D0518f77499B2138833DAf248210d2018dA6F057c07c5846b7Ba6d20DE387FdAEa7036c70D5EF02A8627Effa9e4D40d77649Ed325C6788B610E30974B81bbA

npm run polls:local

npm run dev
```

### Wallet extension

Install latest version of the [Orbs Wallet extension](https://github.com/orbs-network/wallet) for your browser.

Open [polls app page](http://localhost:8000)
