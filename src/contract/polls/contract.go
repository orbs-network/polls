package main

import (
	"encoding/hex"
	"encoding/json"
	"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1"
	"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1/address"
	"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1/state"
)

var PUBLIC = sdk.Export(
	create, get, getPublicKey,
	vote, countVotes, results, finish,
	)
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
func create(id string, name string, publicKey string, options ...string) {
	state.WriteString(_ownerKey(id), _identity())
	state.WriteString(_publicKey(id), publicKey)

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
		Owner:     _getOwner(id),
		Name:      state.ReadString(_nameKey(id)),
		PublicKey: getPublicKey(id),
		Options:   options,
	}

	rawJSON, _ := json.Marshal(poll)
	return string(rawJSON)
}

func _nameKey(id string) []byte {
	return []byte("polls."+id+".name")
}

func _publicKey(id string) []byte {
	return []byte("polls."+id+".publicKey")
}

func _privateKey(id string) []byte {
	return []byte("polls."+id+".privateKey")
}

func _optionsKey(id string) []byte {
	return []byte("polls."+id+".options")
}

func _ownerKey(id string) []byte {
	return []byte("polls."+id+".owner")
}

func _getOwner(id string) string {
	return state.ReadString(_ownerKey(id))
}

func getPublicKey(id string) string {
	return state.ReadString(_publicKey(id))
}

func _identity() string {
	return _identify(address.GetSignerAddress())
}

func _identify(addr []byte) string {
	return hex.EncodeToString(addr)
}

func _getOptions(id string) (options []string) {
	json.Unmarshal(state.ReadBytes(_optionsKey(id)), &options)
	return options
}
