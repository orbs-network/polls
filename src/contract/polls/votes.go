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
	if len(_getResults(id)) != 0 {
		panic("results are already in")
	}

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

	if len(_getResults(id)) != 0 {
		panic("results are already in")
	}

	state.WriteString(_privateKey(id), privateKey)

	results := _calculateResults(id)
	resultsJSON, _ := json.Marshal(results)
	state.WriteBytes(_resultsKey(id), resultsJSON)
}

func _calculateResults(id string) []VotesAggregation {
	if len(_getPrivateKey(id)) == 0 {
		panic("voting did not finish yet")
	}

	var data []VotesAggregation
	options := _getOptions(id)
	for _, option := range options {
		data = append(data, VotesAggregation{
			Name: option,
		})
	}

	totalVotes := countVotes(id)
	privateKey := BytesToPrivateKey(_getPrivateKey(id))

	invalidVotes := uint32(0)
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
			invalidVotes++
		} else {
			data[int(decryptedVote)].Value++
		}
	}

	if invalidVotes > 0 {
		data = append(data, VotesAggregation{
			Name:  "Invalid votes",
			Value: invalidVotes,
		})
	}

	return data
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

func _resultsKey(id string) []byte {
	return []byte("polls." + id + ".results")
}

func _getResults(id string) (results []VotesAggregation) {
	json.Unmarshal(state.ReadBytes(_resultsKey(id)), &results)
	return
}
