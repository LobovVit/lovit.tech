# ========== build stage ==========
FROM golang:1.22 AS build
WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
ARG BUILD_VERSION=dev
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags "-s -w -X 'main.version=${BUILD_VERSION}'" \
    -o /out/app ./cmd/main.go

# ========== runtime stage ==========
FROM gcr.io/distroless/base-debian12
WORKDIR /app
COPY --from=build /out/app /app/app
EXPOSE 8080
USER 65532:65532
CMD ["/app/app"]