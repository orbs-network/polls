package main

import (
	"encoding/hex"

	"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1/address"
	"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1/service"
	"github.com/orbs-network/orbs-contract-sdk/go/sdk/v1/state"
)

var IDENTITY_KEY = []byte("IDENTITY_CONTRACT_ADDRESS")

func setIdentityContractAddress(contractAddress string) {
	_contractOwnerOnly()

	state.WriteString(IDENTITY_KEY, contractAddress)
}

func _getIdentityContractAddress() string {
	return state.ReadString(IDENTITY_KEY)
}

func _identity() string {
	return _identify(address.GetSignerAddress())
}

func _identify(addr []byte) string {
	if identityContractAddress := _getIdentityContractAddress(); identityContractAddress != "" {
		results := service.CallMethod(identityContractAddress, "getIdByAddress", addr)
		if len(results) == 1 && results[0].(string) != "" {
			return results[0].(string)
		}

		panic("identity not found for address " + hex.EncodeToString(addr))
	}

	return hex.EncodeToString(addr)
}
