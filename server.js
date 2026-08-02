const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));

function getFileMD5(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(buffer).digest('hex');
}

app.get('/health', (req, res) => {
  res.json({code:200,msg:"服务正常"});
});

app.get('/api/checkVersion', async (req, res) => {
  try {
    const verFile = path.join(__dirname, 'static/update/version.json');
    const verCfg = JSON.parse(fs.readFileSync(verFile, 'utf8'));
    const pluginPath = path.join(__dirname, 'static/update/patch', verCfg.pluginFileName);
    const pluginMd5 = getFileMD5(pluginPath);

    const DOMAIN = "https://fuwuqi‑io8t.onrender.com";
    const data = {
      pluginVersionCode: verCfg.pluginVersionCode,
      pluginVersionName: verCfg.pluginVersionName,
      pluginPatchUrl: `${DOMAIN}/static/update/patch/${verCfg.pluginFileName}`,
      pluginMd5: pluginMd5,
      pluginUpdateLog: verCfg.pluginUpdateLog,
      onlyWifiDownload: verCfg.onlyWifiDownload
    };
    res.json({ code: 200, data });
  } catch (e) {
    res.json({ code: 500, msg: "读取版本配置失败" });
  }
});

app.listen(PORT, () => {
  console.log(`服务启动端口${PORT}`);
});
