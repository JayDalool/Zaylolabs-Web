FROM python:3.13-alpine
RUN adduser -D -u 10001 app
USER app
WORKDIR /app
COPY inquiry.py .
ENV PYTHONUNBUFFERED=1 PORT=8080
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=4s --retries=3 CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8080/api/health', timeout=3)"]
CMD ["python", "inquiry.py"]
