// Inspired by the examples found @ github.com/gorilla/websocket

package main

type Message struct {
	data []byte
}

func newMessage(message []byte) *Message {
	return &Message{
		data: message,
	}
}
