FROM python:3.11-slim

# Install dependencies for building Flutter (if needed) and Python
RUN apt-get update && apt-get install -y --no-install-recommends     git     curl     unzip     && rm -rf /var/lib/apt/lists/*

# Install Flutter SDK
RUN git clone https://github.com/flutter/flutter.git /flutter
ENV PATH="/flutter/bin:$PATH"

# Setup working directory
WORKDIR /app
COPY . .

# Install Python backend dependencies
RUN pip install --no-cache-dir -r backend/requirements.txt

# Build Flutter Web
RUN flutter config --enable-web && flutter pub get && flutter build web --release

# Setup FastAPI to serve build/web as static files
# We'll use a python script or direct uvicorn to serve both
RUN pip install uvicorn

# Expose port 3000
EXPOSE 3000

# Start script
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
