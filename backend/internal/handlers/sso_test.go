package handlers

import (
	"backend/internal/identity"
	"backend/internal/testoidc"
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestSessionAndLogoutCSRF(t *testing.T) {
	p := testoidc.New(t, nil)
	login, e := identity.New(context.Background(), identity.Config{Issuer: p.Server.URL, ClientID: "studio", ClientSecret: "test-secret", RedirectURL: "https://lovit.tech/auth/callback"})
	if e != nil {
		t.Fatal(e)
	}
	s := NewSiteSSO(login)
	id, e := s.Sessions.Add(identity.Subject{Issuer: p.Server.URL, ID: "user", SessionID: "sid"}, "")
	if e != nil {
		t.Fatal(e)
	}
	for _, tc := range []struct{ id, want string }{{id, "true"}, {"unknown", "false"}} {
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
		r.AddCookie(&http.Cookie{Name: "__Host-lovit-session", Value: id})
		w := httptest.NewRecorder()
		s.Logout(w, r)
		_, exists := s.Sessions.Get(id)
		if origin != "https://lovit.tech" {
			if w.Code != 403 || !exists {
				t.Fatal("cross-origin logout accepted")
			}
		} else {
			if w.Code != 200 || exists || !strings.Contains(w.Body.String(), "logoutUrl") {
				t.Fatal("logout failed")
			}
			c := w.Result().Cookies()[0]
			if !c.Secure || !c.HttpOnly || c.Domain != "" || c.MaxAge != -1 {
				t.Fatal("unsafe cookie")
			}
		}
	}
}
