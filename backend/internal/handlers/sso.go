package handlers

import (
	"backend/internal/identity"
	"encoding/json"
	"net/http"
)

type SiteSSO struct {
	Login    *identity.Login
	Sessions *identity.Sessions
}

func NewSiteSSO(login *identity.Login) *SiteSSO {
	return &SiteSSO{Login: login, Sessions: identity.NewSessions()}
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
	id, err := s.Sessions.Add(sub, "")
	if err != nil {
		http.Error(w, "Повторите единый вход", 401)
		return
	}
	if old, e := r.Cookie("__Host-lovit-session"); e == nil {
		s.Sessions.Delete(old.Value)
	}
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
		_, ok = s.Sessions.Get(c.Value)
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
	target, err := s.Login.LogoutURL()
	if err != nil {
		http.Error(w, "Общий выход временно недоступен", 503)
		return
	}
	if c, e := r.Cookie("__Host-lovit-session"); e == nil {
		s.Sessions.Delete(c.Value)
	}
	sessionCookie(w, "", -1)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{"logoutUrl": target})
}
func (s *SiteSSO) Backchannel(w http.ResponseWriter, r *http.Request) {
	sub, err := s.Login.VerifyLogout(r)
	if err != nil {
		http.Error(w, "Invalid logout token", 400)
		return
	}
	s.Sessions.Revoke(sub)
	w.WriteHeader(200)
}
