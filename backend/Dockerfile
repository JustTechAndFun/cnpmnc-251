# Stage 1: Build stage
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src

RUN mvn clean package -DskipTests

# Stage 2: Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy the JAR file
COPY --from=build /app/target/*.jar app.jar

# Create resources directory for ca.pem
RUN mkdir -p /app/resources

# Install bash for better shell support
RUN apk add --no-cache bash

# Create startup script
RUN echo '#!/bin/bash' > /app/start.sh && \
    echo 'echo "Starting application..."' >> /app/start.sh && \
    echo 'if [ -f /etc/secrets/ca.pem ]; then' >> /app/start.sh && \
    echo '  cp /etc/secrets/ca.pem /app/resources/ca.pem' >> /app/start.sh && \
    echo '  echo "Copied ca.pem from Render Secret Files"' >> /app/start.sh && \
    echo 'else' >> /app/start.sh && \
    echo '  echo "Warning: ca.pem not found at /etc/secrets/ca.pem"' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo 'exec java ${JAVA_OPTS:--Xmx512m -Xms256m} -jar app.jar' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 8000

ENV SPRING_PROFILES_ACTIVE=prod

# Use the startup script
CMD ["/app/start.sh"]
