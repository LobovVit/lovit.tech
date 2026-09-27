package identity

import (
	"errors"
	"sync"
	"time"
)

// Sessions is a single-instance, fail-closed session registry. Restart requires SSO again.
// Sessions хранит сессии одного экземпляра; перезапуск требует повторного SSO.
type Sessions struct {
	mu      sync.Mutex
	active  map[string]Session
	revoked map[string]time.Time
}
type Session struct {
	Subject Subject
	Scope   string
	Expires time.Time
}

func NewSessions() *Sessions {
	return &Sessions{active: map[string]Session{}, revoked: map[string]time.Time{}}
}
func (s *Sessions) sweep(now time.Time) {
	for k, v := range s.active {
		if !now.Before(v.Expires) {
			delete(s.active, k)
		}
	}
	for k, v := range s.revoked {
		if !now.Before(v) {
			delete(s.revoked, k)
		}
	}
}
func (s *Sessions) Add(sub Subject, scope string) (string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now()
	s.sweep(now)
	if sub.ID == "" || sub.SessionID == "" || len(s.active) >= 10000 || len(s.revoked) >= 10000 {
		return "", errors.New("SSO session unavailable")
	}
	if _, ok := s.revoked["sid:"+sub.SessionID]; ok {
		return "", errors.New("SSO session revoked")
	}
	if _, ok := s.revoked["sub:"+sub.ID]; ok {
		return "", errors.New("SSO subject revoked")
	}
	id := random()
	s.active[id] = Session{sub, scope, now.Add(12 * time.Hour)}
	return id, nil
}
func (s *Sessions) Get(id string) (Session, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	v, ok := s.active[id]
	if !ok || !time.Now().Before(v.Expires) {
		delete(s.active, id)
		return Session{}, false
	}
	return v, true
}
func (s *Sessions) Delete(id string) { s.mu.Lock(); defer s.mu.Unlock(); delete(s.active, id) }
func (s *Sessions) Revoke(sub Subject) {
	s.mu.Lock()
	defer s.mu.Unlock()
	now := time.Now()
	s.sweep(now)
	// At capacity invalidate all local sessions rather than silently dropping revocations.
	// При переполнении отзываем локальные сессии, а не теряем событие отзыва.
	if len(s.revoked) >= 10000 {
		s.active = map[string]Session{}
		return
	}
	key := "sid:" + sub.SessionID
	if sub.SessionID == "" {
		key = "sub:" + sub.ID
	}
	s.revoked[key] = now.Add(12 * time.Hour)
	for k, v := range s.active {
		if v.Subject.Issuer == sub.Issuer && ((sub.SessionID != "" && v.Subject.SessionID == sub.SessionID) || (sub.SessionID == "" && v.Subject.ID == sub.ID)) {
			delete(s.active, k)
		}
	}
}
