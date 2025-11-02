# Stage 1: Build stage
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src

# Copy ca.pem from Render Secret Files to resources directory during build
# Render mounts secret files at /etc/secrets/<filename>
RUN if [ -f /etc/secrets/ca.pem ]; then \
      cp /etc/secrets/ca.pem /app/src/main/resources/ca.pem; \
    fi

RUN mvn clean package -DskipTests

# Stage 2: Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Create resources directory for ca.pem
RUN mkdir -p /app/resources

EXPOSE 8000

ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Entrypoint script to handle ca.pem from Render Secret Files
# Render mounts secret files at /etc/secrets/<filename>
ENTRYPOINT ["sh", "-c", "\
  if [ -f /etc/secrets/ca.pem ]; then \
    cp /etc/secrets/ca.pem /app/resources/ca.pem; \
    echo 'Copied ca.pem from Render Secret Files to /app/resources/ca.pem'; \
  elif [ -f /app/ca.pem ]; then \
    cp /app/ca.pem /app/resources/ca.pem; \
    echo 'Using ca.pem from /app/ca.pem'; \
  else \
    echo 'Warning: ca.pem not found'; \
  fi; \
  java $JAVA_OPTS -Dspring.config.additional-location=file:/app/resources/ -jar app.jar"]
