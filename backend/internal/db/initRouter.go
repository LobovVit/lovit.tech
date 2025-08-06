package db

import (
	"context"
	"errors"
	"github.com/google/uuid"
	"github.com/tarantool/go-tarantool/v2"
	vshardrouter "github.com/tarantool/go-vshard-index/v2"
	"github.com/tarantool/go-vshard-router/v2/providers/static"
	"log"
	"time"
)

var Router *vshardrouter.Router

func InitRouter() error {
	ctx := context.Background()

	// Конфигурация подключения к Tarantool
	router, err := vshardrouter.NewRouter(ctx, vshardrouter.Config{
		DiscoveryTimeout: time.Second * 5,
		DiscoveryMode:    vshardrouter.DiscoveryModeOn,
		TopologyProvider: static.NewProvider(map[vshardrouter.ReplicasetInfo][]vshardrouter.InstanceInfo{
			{Name: "default", UUID: uuid.New()}: {
				{Addr: "tarantool:3301", Name: "tarantool"},
			},
		}),
		TotalBucketCount: 3000,
		PoolOpts: tarantool.Opts{
			Timeout: time.Second,
		},
	})
	if err != nil {
		return errors.New("не удалось создать роутер: " + err.Error())
	}

	Router = router
	log.Println("✅ Tarantool index инициализирован")
	return nil
}
