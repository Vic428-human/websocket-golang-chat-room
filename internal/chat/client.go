package chat

import "github.com/gorilla/websocket"

type Client struct {
	socket  *websocket.Conn
	receive chan []byte
	room    *Room
}
