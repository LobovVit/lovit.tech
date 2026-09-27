package handlers

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

func TestSessionExpiryAndLogoutCSRF(t *testing.T) {
	s := NewSiteSSO(nil)
	s.sessions["active"] = siteSession{expires: time.Now().Add(time.Hour)}
	s.sessions["expired"] = siteSession{expires: time.Now().Add(-time.Hour)}
	for _, tc := range []struct{ id, want string }{{"active", "true"}, {"expired", "false"}, {"unknown", "false"}} {
		r := httptest.NewRequest("GET", "https://lovit.tech/auth/me", nil)
		r.AddCookie(&http.Cookie{Name: "__Host-lovit-session", Value: tc.id})
		w := httptest.NewRecorder()
		s.Me(w, r)
		if !strings.Contains(w.Body.String(), `"authenticated":`+tc.want) {
			t.Fatal(w.Body.String())
		}
	}
	for _, origin := range []string{"https://evil.example", "", "https://lovit.tech"} {
		r := httptest.NewRequest("POST", "https://lovit.tech/auth/logout", nil)
		r.Header.Set("Origin", origin)
		r.AddCookie(&http.Cookie{Name: "__Host-lovit-session", Value: "active"})
		w := httptest.NewRecorder()
		s.Logout(w, r)
		_, exists := s.sessions["active"]
		if origin != "https://lovit.tech" {
			if w.Code != 403 || !exists {
				t.Fatal("cross-origin logout accepted")
			}
		} else {
			if w.Code != 204 || exists {
				t.Fatal("logout failed")
			}
			c := w.Result().Cookies()[0]
			if !c.Secure || !c.HttpOnly || c.Domain != "" || c.MaxAge != -1 {
				t.Fatal("unsafe cookie")
			}
		}
	}
}
