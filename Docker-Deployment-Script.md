# Docker Deployment Script

## On local
```bash
$ docker build -t backend_v2 .

$ docker tag backend_v2 sayanmdn/backend_v2:v1
$ docker push sayanmdn/backend_v2:v1
```

## On server
```bash
$ docker pull sayanmdn/backend_v2:v1
$ docker run -d -p 8080:8080 sayanmdn/backend_v2:v1
```