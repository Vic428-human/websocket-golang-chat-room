package chat

import "github.com/gorilla/websocket"

type Client struct {
	socket  *websocket.Conn
	receive chan []byte
	room    *Room
}

func NewClient(conn *websocket.Conn, room *Room) *Client {
	return &Client{
		socket:  conn,
		receive: make(chan []byte, 256),
		room:    room,
	}
}

func (c *Client) ReadPump() {
	defer c.socket.Close()

	for {
		_, msg, err := c.socket.ReadMessage()
		if err != nil {
			return
		}
		c.room.forward <- msg
	}
}

func (c *Client) WritePump() {
	defer c.socket.Close()

	for msg := range c.receive {
		if err := c.socket.WriteMessage(websocket.TextMessage, msg); err != nil {
			return
		}
	}
}
