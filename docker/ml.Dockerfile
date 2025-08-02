FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY ml/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the ML service code
COPY ml .

EXPOSE 5000

CMD ["python", "app.py"]