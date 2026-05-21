FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN --mount=type=cache,target=/root/.npm npm install --no-audit --no-fund

COPY . .

EXPOSE 5181

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
