package main

import (
	"log"
	"net/http"
	"os"

	"github.com/Vic428-human/websocket-golang-chat-room/internal/chat"
	"github.com/gorilla/websocket"
)

/*
測試在瀏覽器輸入
let ws = new WebSocket("ws://localhost:8080/ws")
ws.onmessage = (e) => console.log("server:", e.data)
ws.send("hello")

這代表：
Upgrade 成功
ReadMessage 成功
WriteMessage 成功
pipeline 正常
*/

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 256,
	// Demo 用：先允許所有 origin，正式環境要收緊
	CheckOrigin: func(r *http.Request) bool { return true },
}

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	// chat room
	room := chat.NewRoom()
	go room.Run()

	// websocket endpoint
	mux.Handle("/ws", room)

	addr := ":8080"
	if v := os.Getenv("ADDR"); v != "" {
		addr = v
	}

	log.Printf("listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
