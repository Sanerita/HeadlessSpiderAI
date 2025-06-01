FROM python:3.10-slim

WORKDIR /app
COPY backend/ ./

RUN pip install --upgrade pip && \
    pip install -r requirements.txt

CMD ["python", "main.py"]
