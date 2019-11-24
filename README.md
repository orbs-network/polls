# Polls

Polls is an on-chain voting system with secret votes. Unfortunately, the drawback of using public key cryptography is that the publisher of the poll can see the votes before anybody else can see them.

## The flow

* the owner of the poll publishes the poll with a unique id, name, list of options, and a public key
* the voters encrypt their votes and submit them
* the owner closes the poll by publishing a private key
* after that, the results are in and can be calculated inside of the smart contract
