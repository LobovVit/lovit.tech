package main

import (
	"backend/internal/handlers"
	"backend/internal/identity"
	"context"
	"log"
	"net/http"
	"os"
	"time"
)

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/ping", handlers.PingHandler)
	mux.HandleFunc("/auth/login", handlers.AuthLogin)
	mux.HandleFunc("/auth/signup", handlers.AuthSignup)

	login, err := identity.New(context.Background(), identity.Config{Issuer: os.Getenv("OIDC_ISSUER"), ClientID: os.Getenv("OIDC_CLIENT_ID"), ClientSecret: os.Getenv("OIDC_CLIENT_SECRET"), RedirectURL: os.Getenv("OIDC_REDIRECT_URL")})
	if err != nil {
		log.Fatal("OIDC setup failed: ", err)
	}
	sso := handlers.NewSiteSSO(login)
	mux.HandleFunc("/auth/authorize", login.Start)
	mux.HandleFunc("/auth/callback", sso.Callback)
	mux.HandleFunc("/auth/me", sso.Me)
	mux.HandleFunc("/auth/logout", sso.Logout)
	mux.HandleFunc("/auth/backchannel-logout", sso.Backchannel)
	log.Println("Backend started on :8080")
	if err := (&http.Server{Addr: ":8080", Handler: mux, ReadHeaderTimeout: 5 * time.Second, IdleTimeout: 60 * time.Second}).ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}
