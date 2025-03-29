const fs = require("fs");
const path = require("path");
const { Font } = require("fonteditor-core");

const aFontPath = path.join(__dirname, "./fonts/SlacksideOne.ttf");
const bFontPath = path.join(__dirname, "./fonts/HachiMaruPop.ttf");
const outputFontPath = path.join(__dirname, "./Slackside80Pop.ttf");

async function mergeFonts() {
  try {
    const aBuffer = fs.readFileSync(aFontPath);
    const bBuffer = fs.readFileSync(bFontPath);

    const aFont = Font.create(aBuffer, { type: "ttf" });
    const bFont = Font.create(bBuffer, { type: "ttf" });

    const aData = aFont.get();
    const bData = bFont.get();

    const aGlyf = aData.glyf || [];
    const bGlyf = bData.glyf || [];

    console.log("フォント A:", aGlyf.length, "グリフ");
    console.log("フォント B:", bGlyf.length, "グリフ");

    const aUnicodeSet = new Set(aGlyf.map(g => g.unicode).flat().filter(Boolean));
    const missingGlyphs = bGlyf.filter(g => g.unicode && !aUnicodeSet.has(g.unicode[0]));

    console.log("追加するグリフ数:", missingGlyphs.length);

    for (let glyph of missingGlyphs) {
      if (!glyph.contours) glyph.contours = [];
      if (!glyph.advanceWidth) glyph.advanceWidth = 500;
    }

    aGlyf.push(...missingGlyphs);

    aData.maxp.numGlyphs = aGlyf.length;

    if (!aData.cmap) {
      aData.cmap = {};
    }

    for (let glyph of missingGlyphs) {
      if (glyph.unicode && glyph.unicode.length > 0) {
        aData.cmap[glyph.unicode[0]] = aGlyf.indexOf(glyph);
      }
    }

    aData.name = aData.name || {};
    aData.name.fontFamily = "Slackside80Pop";
    aData.name.fullName = "Slackside80Pop";
    aData.name.postScriptName = "Slackside80Pop-Regular";
    aData.name.version = "1.0.1";

    aData.head.checksumAdjustment = 0;
    aData.post.format = 2;
    aFont.set(aData);

    const mergedBuffer = aFont.write({ type: "ttf" });

    fs.writeFileSync(outputFontPath, Buffer.from(mergedBuffer));
    console.log(`フォントを作成しました: ${outputFontPath}`);
  } catch (err) {
    console.error("エラー:", err);
  }
}

mergeFonts();
