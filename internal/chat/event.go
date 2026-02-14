package chat

type Event struct {
	Type   string `json:"type"`             // "chat" | "typing"
	Name   string `json:"name"`             // sender name
	Text   string `json:"text,omitempty"`   // only for chat
	Typing bool   `json:"typing,omitempty"` // only for typing
	Ts     int64  `json:"ts"`               // server timestamp (ms)
}
