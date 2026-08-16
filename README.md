# SIMME

Sistema de empréstimos de materiais escolares, construído com Next.js e MySQL 8.0+.

## Requisitos

- Node.js 20 ou superior
- MySQL 8.0 ou superior

## Configuração local

1. Crie o banco de dados:

   ```sql
   CREATE DATABASE simme CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. Copie o arquivo de exemplo e informe suas credenciais:

   ```bash
   cp .env.example .env.local
   ```

   Exemplo de conexão:

   ```env
   DATABASE_URL=mysql://usuario:senha@localhost:3306/simme
   SESSION_SECRET=uma-chave-longa-e-aleatoria
   ADMIN_INITIAL_PASSWORD=defina-uma-senha-inicial-segura
   ```

3. Crie as tabelas:

   ```bash
   mysql -u usuario -p simme < database/schema.sql
   ```

4. Instale e execute:

   ```bash
   npm install
   npm run dev
   ```

O endereço padrão é `http://localhost:3000`. A senha administrativa inicial é definida por `ADMIN_INITIAL_PASSWORD` somente na primeira inicialização.

## Entrega para o backend

Envie um arquivo ZIP contendo o código-fonte, incluindo `database/schema.sql`, `.env.example`, `package.json`, `package-lock.json` e este README.

Não envie `.env.local`, senhas, dumps com dados reais ou `node_modules`. Para criar o ZIP a partir da pasta pai:

```bash
zip -r simme.zip simme -x 'simme/node_modules/*' 'simme/.next/*' 'simme/.env.local' 'simme/.git/*' 'simme/.idea/*' 'simme/tsconfig.tsbuildinfo'
```

Quem receber o projeto deve seguir a seção **Configuração local** para criar o banco e iniciar a aplicação.
