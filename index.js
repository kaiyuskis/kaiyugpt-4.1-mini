require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

const SYSTEM_PROMPT = [
  {
    "role": "system",
    "content": [
      {
        "type": "text",
        "text": `Z世代向けAIアシスタントチャットボットを構築するために、以下のガイドラインに従い対応してください。

ユーザーとの対話において、Z世代の特性や嗜好を反映し、親しみやすく、活気に満ちたコミュニケーションを心掛けてください。

# Steps

1. **ターゲット理解**: 
  - Z世代（1997年から2012年生まれ）に関連する特徴や嗜好を把握する。
  - 彼らが興味を持つ話題をリスト化する。（例：テクノロジー、ソーシャルメディア、環境問題）

2. **対話スタイル**: 
  - カジュアルでフレンドリーなトーンを使用。
  - スラングや流行語を適切に活用するが、理解しやすさを保つ。
  - 音声と絵文字を追加して、親しみやすさを高める。

3. **パーソナライゼーション**:
  - ユーザーの名前や過去の対話内容を活用して会話をパーソナライズ。
  - 質問への回答を個別に調整し、関心を引くようにする。

4. **情報提供**: 
  - 信頼性のある最新の情報を提供する。
  - 情報ソースの信頼性を示し、フェイクニュースを避ける。

5. **反応とフィードバック**:
  - ユーザーからのフィードバックを受け取り、サービスの改善に活かす。
  - 対話から得たデータを分析して、トレンドを把握し、対応をアップデート。

# Output Format

- ダイアログ形式
- フレンドリーで親しみやすいトーン
- 必要に応じて短い説明や関連例を含める

# Notes

- 常にユーザーのプライバシーを尊重し、データを安全に扱う。
- 文化的な違いや多様性を意識し、偏った視点を持たない。

このガイドラインに従うことで、Z世代に親しみやすいAIチャットボットを効果的に提供できます。`
      }
    ]
  }
];

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // ボットがメンションされたときのみ反応
  if (message.mentions.has(client.user)) {
    const userId = message.author.id;
    const prompt = message.content.replace(`<@${client.user.id}>`, '').trim();
    const userName = message.member?.nickname || message.author.username;

    // 添付画像があれば最初の画像URLを取得
    const imageAttachment = message.attachments.find(att => att.contentType && att.contentType.startsWith('image/'));

    let messagesPayload = JSON.parse(JSON.stringify(SYSTEM_PROMPT)); // Deep copy

    if (imageAttachment) {
      // テキスト＋画像
      messagesPayload.push({
        role: "user",
        content: [
          { type: "text", text: `${prompt || "この画像について教えて！"}（送信者: ${userName}）` },
          { type: "image_url", image_url: { url: imageAttachment.url } }
        ]
      });
    } else {
      // テキストのみ
      messagesPayload.push({
        role: "user",
        content: [
          {
            type: "text",
            text: `${prompt}（送信者: ${userName}）`
          }
        ]
      });
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: messagesPayload,
        response_format: { type: "text" },
        temperature: 1,
        max_completion_tokens: 4096,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        store: false
      });

      const reply = response.choices?.[0]?.message?.content || "回答できなかったよ。";
      console.log(`[${new Date().toISOString()}] User(${userId}): ${prompt}${imageAttachment ? " (画像あり)" : ""}`);
      console.log(`[${new Date().toISOString()}] Bot: ${reply}\n`);

      await message.reply(reply);
    } catch (error) {
      console.error(error);
      message.reply("エラーが発生したよ。もう一度試してみてね。");
    }
  }
});

client.login(process.env.DISCORD_TOKEN);