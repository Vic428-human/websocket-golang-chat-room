package main

import (
	"flag"
	"log"
	"net/http"

	"github.com/Vic428-human/websocket-golang-chat-room/internal/chat"
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
func main() {

	var addr = flag.String("addr", ":8080", "Addr of the app")
	flag.Parse()
	// chat room
	room := chat.NewRoom()

	// websocket endpoint
	http.Handle("/ws", room)

	go room.Run()

	log.Printf("Starting web server on: ", *addr)
	if err := http.ListenAndServe(*addr, nil); err != nil {
		log.Fatal(err)
	}
}
