package chat

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

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

// 房間不主動索取：room.run() 被動等待 <-r.forward，不會主動向客戶端要數據
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

		// forward 通道，是 webdocket 對瀏覽器透過 read方法 讀取訊息時，
		// 透過 forward 通道傳遞訊息 ex: client.go 裡的 read()
		// 所以 websocket 讀取完瀏覽器的訊息後，如果要發給所有房間內的clients
		// 就會把 forward 裡的訊息都轉發給 clients
		// 而每一個 client 都有自己的 receive 通道，
		// 所以房間要把訊息給 clients時，就是把消息透過 forward 通道 轉給 recevie通道的過程
		case msg := <-r.forward:
			for c := range r.clients {
				select {
				case c.receive <- msg:
					// ok
				default:
					// 慢 client：選擇一種策略
					// 1) drop message (最簡單)
					// 2) or disconnect:
					delete(r.clients, c)
					close(c.receive)
				}
			}
		}
	}
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 256,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func (r *Room) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	conn, err := upgrader.Upgrade(w, req, nil)
	if err != nil {
		log.Println("ServeHTTP upgrade:", err)
		return
	}

	client := NewClient(conn, r)
	// 在 ServeHTTP 設定 name
	client.name = req.URL.Query().Get("name")

	if client.name == "" {
		client.name = "匿名"
	}

	// register
	r.join <- client

	// unregister on exit
	defer func() {
		r.leave <- client
	}()

	go client.WritePump()
	client.ReadPump() // block
}
