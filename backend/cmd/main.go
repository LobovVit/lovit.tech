package main

import (
	"backend/internal/handlers"
	"log"
	"net/http"
)

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/ping", handlers.PingHandler)
	mux.HandleFunc("/auth/login", handlers.AuthLogin)
	mux.HandleFunc("/auth/signup", handlers.AuthSignup)

	log.Println("🚀 Backend started on :8080")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatal(err)
	}
}
