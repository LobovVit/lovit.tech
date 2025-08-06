package main

import (
	"backend/internal/db"
	"log"
	"net/http"

	"backend/internal/handlers"
)

func main() {
	if err := db.InitRouter(); err != nil {
		log.Fatalf("❌ Не удалось инициализировать index: %v", err)
	}
	mux := http.NewServeMux()
	mux.HandleFunc("/ping", handlers.PingHandler)

	log.Println("🚀 Backend started on :8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}
