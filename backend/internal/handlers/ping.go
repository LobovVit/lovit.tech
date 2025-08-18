package handlers

import (
	"encoding/json"
	"net/http"
)

func PingHandler(w http.ResponseWriter, r *http.Request) {
	data := "Привет с бекенда"

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
