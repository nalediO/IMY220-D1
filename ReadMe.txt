docker build -t omph .
docker run -p 3005:8888 omph
docker run -p 8080:8080 -p 5000:5000 omph