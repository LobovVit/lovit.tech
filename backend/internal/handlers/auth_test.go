package handlers

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestLegacyAuthDoesNotIssueTokens(t *testing.T) {
	for _, handler := range []http.HandlerFunc{AuthLogin, AuthSignup} {
		for _, method := range []string{http.MethodGet, http.MethodPost} {
			req := httptest.NewRequest(method, "/auth/login", strings.NewReader(`{"email":"test@example.com","password":"anything"}`))
			rec := httptest.NewRecorder()
			handler(rec, req)
			expected := http.StatusServiceUnavailable
			if method == http.MethodGet {
				expected = http.StatusMethodNotAllowed
			}
			if rec.Code != expected || strings.Contains(rec.Body.String(), "token") {
				t.Fatalf("unsafe response: %d %s", rec.Code, rec.Body.String())
			}
			if rec.Header().Get("Cache-Control") != "no-store" {
				t.Fatal("response must not be cached")
			}
		}
	}
}
