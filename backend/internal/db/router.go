package db

import (
	"context"
	"fmt"
	"time"

	router "github.com/tarantool/go-vshard-router/v2"
)

func GetFirstUser() (interface{}, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	bucketID := uint64(0)
	args := []interface{}{nil, []interface{}{0, 1}} // offset=0, limit=1

	resp, err := Router.Call(
		ctx,
		bucketID,
		router.CallModeRO,
		"box.space.users:select",
		args,
		router.CallOpts{
			Timeout: 2 * time.Second,
		},
	)
	if err != nil {
		return nil, fmt.Errorf("ошибка вызова Tarantool: %w", err)
	}

	return resp.Get()
}
