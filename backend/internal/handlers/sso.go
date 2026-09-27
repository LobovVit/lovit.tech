package handlers

import (
	"backend/internal/identity"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"sync"
	"time"
)

type siteSession struct {
	subject identity.Subject
	expires time.Time
}
type SiteSSO struct {
	Login    *identity.Login
	mu       sync.Mutex
	sessions map[string]siteSession
}

func NewSiteSSO(login *identity.Login) *SiteSSO {
	return &SiteSSO{Login: login, sessions: make(map[string]siteSession)}
}
func sessionCookie(w http.ResponseWriter, id string, age int) {
	http.SetCookie(w, &http.Cookie{Name: "__Host-lovit-session", Value: id, Path: "/", HttpOnly: true, Secure: true, SameSite: http.SameSiteLaxMode, MaxAge: age})
}
func (s *SiteSSO) Callback(w http.ResponseWriter, r *http.Request) {
	sub, err := s.Login.Complete(w, r)
	if err != nil {
		http.Error(w, "Не удалось войти. Вернитесь на сайт и повторите вход.", http.StatusUnauthorized)
		return
	}
	var b [32]byte
	if _, err = rand.Read(b[:]); err != nil {
		http.Error(w, "Сервис недоступен", 503)
		return
	}
	id := base64.RawURLEncoding.EncodeToString(b[:])
	s.mu.Lock()
	now := time.Now()
	for k, v := range s.sessions {
		if now.After(v.expires) {
			delete(s.sessions, k)
		}
	}
	if len(s.sessions) >= 10000 {
		s.mu.Unlock()
		http.Error(w, "Сервис занят", 503)
		return
	}
	if old, e := r.Cookie("__Host-lovit-session"); e == nil {
		delete(s.sessions, old.Value)
	}
	s.sessions[id] = siteSession{sub, now.Add(12 * time.Hour)}
	s.mu.Unlock()
	sessionCookie(w, id, 43200)
	http.Redirect(w, r, "/", http.StatusSeeOther)
}
func (s *SiteSSO) Me(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store")
	w.Header().Set("Content-Type", "application/json")
	if r.Method != "GET" {
		w.WriteHeader(405)
		return
	}
	c, e := r.Cookie("__Host-lovit-session")
	ok := false
	if e == nil {
		s.mu.Lock()
		v, exists := s.sessions[c.Value]
		ok = exists && time.Now().Before(v.expires)
		if !ok {
			delete(s.sessions, c.Value)
		}
		s.mu.Unlock()
	}
	_ = json.NewEncoder(w).Encode(map[string]bool{"authenticated": ok})
}
func (s *SiteSSO) Logout(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store")
	if r.Method != "POST" {
		w.WriteHeader(405)
		return
	}
	if r.Header.Get("Origin") != "https://lovit.tech" {
		w.WriteHeader(403)
		return
	}
	if c, e := r.Cookie("__Host-lovit-session"); e == nil {
		s.mu.Lock()
		delete(s.sessions, c.Value)
		s.mu.Unlock()
	}
	sessionCookie(w, "", -1)
	w.WriteHeader(204)
}
