package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"backend/internal/db"

	vshardrouter "github.com/tarantool/go-vshard-index/v2"
)

type GetUserRequest struct {
	ID uint64 `json:"id"`
}

type GetUserResponse struct {
	ID   uint64 `json:"id"`
	Name string `json:"name"`
}

func GetUserHandler(w http.ResponseWriter, r *http.Request) {
	var req GetUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "bad request", http.StatusBadRequest)
		return
	}

	bucketID := db.Router.BucketIDStrCRC32(strconv.FormatUint(req.ID, 10))

	payload := struct {
		BucketID uint64                 `msgpack:"bucket_id"`
		Body     map[string]interface{} `msgpack:"body"`
	}{
		BucketID: bucketID,
		Body:     map[string]interface{}{"user_id": req.ID},
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	resp, err := db.Router.Call(
		ctx,
		bucketID,
		vshardrouter.CallModeRW,
		"get_user",
		[]interface{}{payload},
		vshardrouter.CallOpts{},
	)
	if err != nil {
		http.Error(w, "index error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	var result []GetUserResponse
	if err := resp.GetTyped(&result); err != nil {
		http.Error(w, "decode error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if len(result) == 0 {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result[0])
}

type pingResponse struct {
	Message string `json:"message"`
}

func PingHandler(w http.ResponseWriter, r *http.Request) {
	data, err := db.GetFirstUser()
	if err != nil {
		http.Error(w, "ошибка обращения к Tarantool", http.StatusInternalServerError)
		fmt.Fprint(w, "pong!!!")
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
