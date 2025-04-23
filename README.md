## 実行方法
---
1. .envファイルを作成


2. .envファイルに以下を入力し、保存
    ```
    DISCORD_TOKEN=your-discord-bot-token
    OPENAI_API_KEY=your-openai-api-key
    ```
    ⚠️トークンキーは自分で用意してください


3. Dockerがインストールされている環境で以下を実行
    ```bash
    docker compose up --build
    ```
