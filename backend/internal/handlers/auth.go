package handlers

import (
	"encoding/json"
	"net/http"
)

// AuthLogin rejects the legacy demo login. / Демонстрационный вход отключён.
func AuthLogin(w http.ResponseWriter, r *http.Request) { unavailable(w, r) }

// AuthSignup rejects registration until SSO is connected. / Регистрация ждёт подключения SSO.
func AuthSignup(w http.ResponseWriter, r *http.Request) { unavailable(w, r) }

func unavailable(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	if r.Method != http.MethodPost {
		w.Header().Set("Allow", "POST")
		w.WriteHeader(http.StatusMethodNotAllowed)
	} else {
		w.WriteHeader(http.StatusServiceUnavailable)
	}
	_ = json.NewEncoder(w).Encode(map[string]string{"error": "Вход на сайт пока недоступен. Подключение единого входа готовится."})
}
