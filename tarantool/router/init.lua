local log = require('log')
log.info('init.lua started')

box.cfg{
    listen = os.getenv("TARANTOOL_LISTEN") or "0.0.0.0:3301",
    memtx_memory = 512 * 1024 * 1024,
    wal_dir = "/var/lib/tarantool/wal",
    memtx_dir = "/var/lib/tarantool/memtx",
    vinyl_dir = "/var/lib/tarantool/vinyl"
}

if not box.space.users then
    box.schema.space.create('users')
    box.space.users:format({
        {name = 'id', type = 'unsigned'},
        {name = 'name', type = 'string'},
    })
    box.space.users:create_index('primary', {parts = {'id'}})
    box.space.users:insert{1, 'test_user'}
end

local ok, vshard = pcall(require, 'vshard')
if ok and rawget(_G, 'vshard') then
    if rawget(_G, 'storage') then
        vshard.storage.cfg({
            sharding = {}, -- будет заполнено из tt.yaml
            bucket_count = 3000,
            replication = nil,
            rebalancer_disbalance_threshold = 10,
            collect_lua_garbage = true,
            sync_timeout = 1,
        }, box.info.uuid)
    else
        vshard.index.cfg({
            sharding = {}, -- будет заполнено из tt.yaml
            bucket_count = 3000
        })
    end
end