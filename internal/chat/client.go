package chat

import "github.com/gorilla/websocket"

type Client struct {
	socket  *websocket.Conn
	receive chan []byte
	room    *Room
	name    string
}

func NewClient(conn *websocket.Conn, room *Room) *Client {
	return &Client{
		socket:  conn,
		receive: make(chan []byte, 256),
		// 給 Client 加 name
		room: room,
	}
}

func (c *Client) ReadPump() {
	defer c.socket.Close()

	for {
		_, msg, err := c.socket.ReadMessage()
		if err != nil {
			return
		}
		// 這樣就算前端送「假名字」，server 也會用它綁定的 name。
		c.room.forward <- []byte(c.name + ": " + string(msg))
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
