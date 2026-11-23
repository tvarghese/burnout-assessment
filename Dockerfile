FROM python:3.12-alpine

WORKDIR /app

COPY index.html app.js styles.css ./

EXPOSE 4781

CMD ["python3", "-m", "http.server", "4781", "--bind", "0.0.0.0"]
