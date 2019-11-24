package test

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/hex"
	"encoding/pem"
	"fmt"
	"io/ioutil"
	"log"
	"testing"
)

func TestEncryption(t *testing.T) {
	privateKey, _ := ioutil.ReadFile("../../../test/keys/id_rsa")
	publicKey, _ := ioutil.ReadFile("../../../test/keys/id_rsa.pub")

	x := EncryptWithPublicKey([]byte("hello"), BytesToPublicKey(publicKey))
	println(hex.EncodeToString(x))

	hmm, _ := hex.DecodeString("507e2f2478cd7892c8c91e90607cd802d4f172fcb229d1415ae6fe1d74f845fc345f0486111787f53625d593ecf4c509f311f1e159ca2299ff3e0b6ac09b6feb0367f88ca1b7c08ad9a2b7282d3e73ea7c8860ec96a9fdee9bcf3147419609cb200f6b22e0b058d88fdb3cae796f4e8869bf331b8f412eaa41697da82eacd819666dd4dabfc13554e15acec91b99fb00cf34c9a55d82460d057220e263d312767e435e5b15807fd982515959013187d966a644a99c5e34f23b9e23da7032874379b54eff8a24d5dd05e579e6a6516bd9eaba58fb7eaf54d3d9e18238ae7727e09f38dfaeee380c28221dd4c88b6c752386c5a549afb2bf5e5d3d40f40549f9aa")

	decrypted := DecryptWithPrivateKey(hmm, BytesToPrivateKey(privateKey))
	println(string(decrypted))
}

// BytesToPrivateKey bytes to private key
func BytesToPrivateKey(priv []byte) *rsa.PrivateKey {
	block, _ := pem.Decode(priv)
	b := block.Bytes
	key, err := x509.ParsePKCS1PrivateKey(b)
	if err != nil {
		log.Panic(err)
	}
	return key
}

// BytesToPrivateKey bytes to private key
func BytesToPublicKey(priv []byte) *rsa.PublicKey {
	block, _ := pem.Decode(priv)

	b := block.Bytes
	fmt.Println(b)
	key, err := x509.ParsePKCS1PublicKey(b)
	if err != nil {
		log.Panic(err)
	}
	return key
}


// EncryptWithPublicKey encrypts data with public key
func EncryptWithPublicKey(msg []byte, pub *rsa.PublicKey) []byte {
	ciphertext, err := rsa.EncryptPKCS1v15(rand.Reader, pub, msg)
	if err != nil {
		log.Panic(err)
	}
	return ciphertext
}

// DecryptWithPrivateKey decrypts data with private key
func DecryptWithPrivateKey(ciphertext []byte, priv *rsa.PrivateKey) []byte {
	plaintext, err := rsa.DecryptPKCS1v15(nil, priv, ciphertext)
	if err != nil {
		log.Panic(err)
	}
	return plaintext
}