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

func (r *Room) Run() {
	for {
		select {
		case c := <-r.join:
			r.clients[c] = true

		case c := <-r.leave:
			if _, ok := r.clients[c]; ok {
				delete(r.clients, c)
				close(c.receive)
			}

		case msg := <-r.forward:
			for c := range r.clients {
				c.receive <- msg
			}
		}
	}
}
