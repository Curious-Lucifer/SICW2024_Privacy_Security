FROM alpine:3.18

RUN apk add --no-cache python3 py3-pip

RUN pip3 install --upgrade pip && pip3 install --upgrade flask

RUN mkdir -p /app
WORKDIR /app

COPY ./src/ /app/

EXPOSE 80
ENTRYPOINT ["python3", "app.py"]