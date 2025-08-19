package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
)

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
type signupReq struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}
type authResp struct {
	Token string      `json:"token,omitempty"`
	User  interface{} `json:"user,omitempty"`
	Error string      `json:"error,omitempty"`
}

func AuthLogin(w http.ResponseWriter, r *http.Request) {
	var req loginReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpError(w, "bad json", http.StatusBadRequest)
		return
	}
	req.Email = strings.TrimSpace(req.Email)
	if req.Email == "" || req.Password == "" {
		httpError(w, "email/password required", http.StatusBadRequest)
		return
	}

	// TODO: проверить пользователя в БД, сравнить хеш пароля и т.д.
	// Заглушка: пускаем любого
	resp := authResp{
		Token: "demo-token-123", // TODO: выдать реальный JWT/сессионную cookie
		User: map[string]string{
			"id":    "u_1",
			"name":  "Demo",
			"email": req.Email,
		},
	}
	writeJSON(w, resp)
}

func AuthSignup(w http.ResponseWriter, r *http.Request) {
	var req signupReq
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		httpError(w, "bad json", http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(req.Name) == "" || strings.TrimSpace(req.Email) == "" || len(req.Password) < 6 {
		httpError(w, "invalid fields", http.StatusBadRequest)
		return
	}
	// TODO: создать юзера в БД, захешировать пароль

	resp := authResp{
		Token: "demo-token-456",
		User: map[string]string{
			"id":    "u_2",
			"name":  req.Name,
			"email": req.Email,
		},
	}
	writeJSON(w, resp)
}

func writeJSON(w http.ResponseWriter, v interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	json.NewEncoder(w).Encode(v)
}

func httpError(w http.ResponseWriter, msg string, code int) {
	w.WriteHeader(code)
	writeJSON(w, authResp{Error: msg})
}
