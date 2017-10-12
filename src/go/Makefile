##########
default: build
##########

build: deps lint test
	gox -osarch="darwin/amd64" -output=".bin/{{.OS}}-{{.Arch}}/canvas-sockets" -verbose


clean:
	rm -rf ./.bin

deps:
	godep go install -v -x ./...

errcheck:
	# errcheck github.com/adam-hanna/goLang-api

fmt:
	gofmt -e -s -w .

lint: fmt errcheck

test: lint

.PHONY: default
.PHONY: build clean deps errcheck fmt lint test
