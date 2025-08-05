FROM tarantool/tarantool:3

# Установим зависимости для luarocks и сборки
RUN apt-get update && apt-get install -y \
    git \
    gcc \
    make \
    libc-dev \
    libssl-dev \
    cmake

WORKDIR /app

# Установка vshard через luarocks (tt управляет .rocks сам)
RUN tt rocks install vshard

# Копируем проект
COPY . /app

# Стартуем через tt
CMD ["tt", "start", "router"]