# ClassPeak Scheduler Backend

Backend Spring Boot responsável pelas regras de negócio do agendamento.

## Banco local

Suba o PostgreSQL na raiz do projeto:

```bash
docker compose up -d postgres
```

Configuração padrão:

```text
DB_URL=jdbc:postgresql://localhost:5432/classpeak_scheduler
DB_USERNAME=postgres
DB_PASSWORD=postgres
```

## Rodar a API

```bash
cd backend
mvn spring-boot:run
```

A API sobe em:

```text
http://localhost:8080
```

O frontend usa:

```text
VITE_API_URL=http://localhost:8080
```
