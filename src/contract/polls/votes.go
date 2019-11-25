package main

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/hex"
	"encoding/json"
	"encoding/pem"
	"strconv"

	"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1/state"
)

func countVotes(id string) uint32 {
	return state.ReadUint32(_countKey(id))
}

func vote(id string, singleVote []byte) {
	voter := _identity()
	alreadyVoted := _alreadyVoted(id, voter)

	state.WriteBytes(_singleVoteKey(id, voter), singleVote)

	if !alreadyVoted {
		state.WriteString(_votersListKey(id, countVotes(id)), voter)
		_incVoteCount(id)
	}
}

func finish(id string, privateKey string) {
	if _identity() != _getOwner(id) {
		panic("only the owner can finish the voting process")
	}

	state.WriteString(_privateKey(id), privateKey)
}

func results(id string) string {
	if len(_getPrivateKey(id)) == 0 {
		panic("voting did not finish yet")
	}

	data := make(map[string]uint32)
	options := _getOptions(id)

	totalVotes := countVotes(id)

	privateKey := BytesToPrivateKey(_getPrivateKey(id))

	for i := uint32(0); i < totalVotes; i++ {
		voter := state.ReadString(_votersListKey(id, i))
		singleVote := state.ReadBytes(_singleVoteKey(id, voter))
		println(hex.EncodeToString(singleVote))

		decryptedVoteRaw := DecryptWithPrivateKey(singleVote, privateKey)
		decryptedVote, err := strconv.ParseUint(string(decryptedVoteRaw), 10, 4)
		if err != nil {
			panic(err)
		}

		if err == nil && decryptedVote >= uint64(len(options)) {
			data["Invalid votes"] += 1
		} else {
			data[options[int(decryptedVote)]] += 1
		}

	}

	rawJson, _ := json.Marshal(data)
	return string(rawJson)
}

func BytesToPrivateKey(priv []byte) *rsa.PrivateKey {
	block, _ := pem.Decode(priv)
	b := block.Bytes
	key, err := x509.ParsePKCS1PrivateKey(b)
	if err != nil {
		panic(err)
	}
	return key
}

func DecryptWithPrivateKey(ciphertext []byte, priv *rsa.PrivateKey) []byte {
	plaintext, err := rsa.DecryptPKCS1v15(nil, priv, ciphertext)
	if err != nil {
		panic(err)
	}
	return plaintext
}

func _singleVoteKey(id string, voter string) []byte {
	return []byte("polls." + id + ".votes." + voter)
}

func _votersListKey(id string, index uint32) []byte {
	return []byte("polls." + id + ".voters." + strconv.FormatUint(uint64(index), 10))
}

func _countKey(id string) []byte {
	return []byte("polls." + id + ".count")
}

func _incVoteCount(id string) uint32 {
	count := countVotes(id) + 1
	state.WriteUint32(_countKey(id), count)
	return count
}

func _getPrivateKey(id string) []byte {
	return state.ReadBytes(_privateKey(id))
}

func _alreadyVoted(id string, voter string) bool {
	return len(state.ReadBytes(_singleVoteKey(id, voter))) != 0
}