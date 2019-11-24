package main

import (
	"encoding/hex"
	"encoding/json"
	"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1"
	"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1/address"
	"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1/state"
	"strconv"
)

var PUBLIC = sdk.Export(create, get, vote, countVotes, results)
var SYSTEM = sdk.Export(_init)

func _init() {

}

type Poll struct {
	Id        string
	Owner     string
	Name      string
	PublicKey string
	Options   []string
}

// FIXME add dates
// FIXME check if already exists
func create(id string, name string, publicKeyHex string, options ...string) {
	state.WriteString(_ownerKey(id), _identity())
	publicKey, err := hex.DecodeString(publicKeyHex)
	if err != nil {
		panic(err)
	}
	state.WriteBytes(_publicKey(id), publicKey)

	if name == "" {
		panic("poll name is empty")
	}

	state.WriteString(_nameKey(id), name)

	if len(options) == 0 {
		panic("voting options are empty")
	}

	optionsSerialized, _ := json.Marshal(options)
	state.WriteBytes(_optionsKey(id), optionsSerialized)
}

func get(id string) string {
	options := _getOptions(id)

	poll := Poll{
		Id:        id,
		Owner:     state.ReadString(_ownerKey(id)),
		Name:      state.ReadString(_nameKey(id)),
		PublicKey: hex.EncodeToString(state.ReadBytes(_publicKey(id))),
		Options:   options,
	}

	rawJSON, _ := json.Marshal(poll)
	return string(rawJSON)
}

// FIXME move to encrypted votes
func vote(id string, singleVote uint32)  {
	voter := _identity()
	state.WriteUint32(_singleVoteKey(id, voter), singleVote)
	state.WriteString(_votersListKey(id, countVotes(id)), voter)
	_incVoteCount(id)
}

func _nameKey(id string) []byte {
	return []byte("polls."+id+".name")
}

func _publicKey(id string) []byte {
	return []byte("polls."+id+".publicKey")
}

func _optionsKey(id string) []byte {
	return []byte("polls."+id+".options")
}

func _ownerKey(id string) []byte {
	return []byte("polls."+id+".owner")
}

func _singleVoteKey(id string, voter string) []byte {
	return []byte("polls."+id+".votes."+voter)
}

func _votersListKey(id string, index uint32) []byte {
	return []byte("polls."+id+".voters."+strconv.FormatUint(uint64(index), 10))
}

func _countKey(id string) []byte {
	return []byte("polls."+id+".count")
}

func _identity() string {
	return hex.EncodeToString(address.GetSignerAddress())
}

func _incVoteCount(id string) uint32 {
	count := countVotes(id) + 1
	state.WriteUint32(_countKey(id), count)
	return count
}

func _getOptions(id string) (options []string) {
	json.Unmarshal(state.ReadBytes(_optionsKey(id)), &options)
	return options
}

func countVotes(id string) uint32 {
	return state.ReadUint32(_countKey(id))
}

func results(id string) string {
	data := make(map[string]uint32)
	options := _getOptions(id)

	totalVotes := countVotes(id)

	for i := uint32(0); i < totalVotes; i++ {
		voter := state.ReadString(_votersListKey(id, i))
		singleVote := state.ReadUint32(_singleVoteKey(id, voter))

		if singleVote >= uint32(len(options)) {
			data["Invalid votes"] += 1
		} else {
			data[options[int(singleVote)]] += 1
		}
	}

	rawJson, _ := json.Marshal(data)
	return string(rawJson)
}