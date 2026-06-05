# Estágio 1: Build da aplicação usando Gradle e Java 21
FROM gradle:8.5-jdk21 AS build
WORKDIR /app
# Copia os arquivos de configuração do Gradle primeiro (otimiza o cache do Docker)
COPY build.gradle settings.gradle ./
COPY src ./src
# Compila o projeto gerando o arquivo .jar
RUN gradle bootJar --no-daemon

# Estágio 2: Ambiente de execução leve com Java 21 JRE
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
# Copia o jar gerado pelo Gradle (geralmente termina com -SNAPSHOT.jar ou similar)
COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]