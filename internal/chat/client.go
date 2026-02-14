package chat

import (
	"encoding/json"
	"time"

	"github.com/gorilla/websocket"
)

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

		var ev Event
		if err := json.Unmarshal(msg, &ev); err != nil {
			// 如果你想保留舊格式（純字串）也可以在這裡 fallback
			continue
		}

		// server 強制綁定 name（避免偽造）
		ev.Name = c.name
		ev.Ts = time.Now().UnixMilli()

		// typing 或 chat 都廣播
		b, err := json.Marshal(ev)
		if err != nil {
			continue
		}

		c.room.forward <- b
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
