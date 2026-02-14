package chat

type Room struct {
	clients map[*Client]bool
	join    chan *Client
	leave   chan *Client
	forward chan []byte
}

func NewRoom() *Room {
	return &Room{
		forward: make(chan []byte),
		join:    make(chan *Client),
		leave:   make(chan *Client),
		clients: make(map[*Client]bool),
	}
}
