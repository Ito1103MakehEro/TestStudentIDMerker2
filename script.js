const express = require("express");
const multer = require("multer");
const fetch = require("node-fetch");
const FormData = require("form-data");

const app = express();
const upload = multer(); // メモリ保存

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// HTML配信用
app.use(express.static("public"));

app.post("/send-to-discord", upload.single("image"), async (req, res) => {
  const body = req.body;
  const file = req.file;

  const embed = {
    title: "学生証情報",
    color: 3447003,
    fields: [
      { name: "学校名", value: body.school || "-", inline: false },
      { name: "学科", value: body.department || "-", inline: false },
      { name: "名前", value: body.name || "-", inline: false },
      { name: "生年月日", value: body.birthday || "-", inline: true },
      { name: "有効期限", value: body.expiry || "-", inline: true }
    ]
  };

  const form = new FormData();
  form.append("payload_json", JSON.stringify({
    embeds: [embed]
  }));

  // 画像がある場合だけ添付
  if (file) {
    form.append("files[0]", file.buffer, {
      filename: file.originalname,
      contentType: file.mimetype
    });

    // Embedから画像を参照
    embed.image = {
      url: "attachment://" + file.originalname
    };
  }

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      body: form
    });

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log("http://localhost:3000 で起動中");
});
