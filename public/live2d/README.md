# Live2D assets

This directory holds the Live2D model(s) rendered on the blog. All model files are
third-party fan content distributed by their original author and are **not** covered
by the blog's source license. They are used here under the author's free-distribution
terms; see the attribution and terms below.

## Contents

```
live2d/
├── README.md                       ← this file
└── models/
    └── taifish/                    ← "DeepSeek-chan" (大肥鱼) model
        ├── taifish.model3.json     ← model definition (entry point)
        ├── taifish.moc3            ← Cubism model (byte-identical to author's file)
        ├── taifish.physics3.json   ← physics settings (byte-identical)
        ├── taifish.cdi3.json       ← display info / parameter names (byte-identical)
        ├── preview.png             ← 852×852 still (author's original thumbnail)
        ├── preview.webp            ← 512×512 loading placeholder (small, used by the site)
        ├── LICENSE.txt             ← author's usage notice, verbatim (Chinese, UTF-8)
        ├── textures/               ← texture_00.webp … texture_04.webp (max side 2048)
        ├── motions/                ← idle.motion3.json + 7 reaction/transition motions
        └── expressions/            ← 23 .exp3.json expressions
```

The model is loadable by any Cubism 4/5 runtime, e.g.
`pixi-live2d-display`'s Cubism 4 support with the official Cubism Core. The
model3.json path is `/live2d/models/taifish/taifish.model3.json`.

## Attribution (required)

> **Model:** DeepSeek-chan（大肥鱼）
> **Original art & separation:** 神宫凉子
> **Live2D modeling:** 霓虹猫_NeonNeko
> **Source:** 神宫凉子's free-distribution model
> **Bilibili:** 神宫凉子 — search for「神宫凉子」on Bilibili to reach the author's page.

Public content made with this model ("Made with DeepSeek-chan" content) must credit
the model source and the people above. Keep the original author information visible —
do not remove or hide it.

## License summary

The complete, authoritative terms are in
[`models/taifish/LICENSE.txt`](models/taifish/LICENSE.txt) (Chinese, verbatim copy of
the author's `DeepSeek免费 Live2D 模型使用须知.txt`). Short version:

**Allowed**
- Personal VTuber streaming, recorded videos, video uploads, shorts and other
  personal content.
- Earning platform tips/gifts/membership/creator-fund/video revenue from that
  personal content.
- Posting such content on Bilibili, YouTube, X/Twitter and other social platforms.
- Adjusting the model's display/tracking/expression/physics parameters for personal use.
- Personal derivative works (stickers, edits, animations, drawings) with source credit.

**Not allowed**
- Reselling or repackaging the complete model files, or selling rights to the model.
- Re-uploading the complete model files to file hosts / asset sites for others to
  download. (Share the author's original distribution page instead.)
- Claiming authorship, hiding the original author's info, or misrepresenting the origin.
- Illegal use or use that infringes others' rights.

**Commercial use:** personal streaming/content with platform revenue is fine. Brand
advertising, endorsements, corporate promotion, or using the model as part of a paid
product requires prior permission from the author.

This is a summary only — in case of doubt, read `LICENSE.txt` or contact the author.

## Technical notes (web conversion)

The author distributes a VTube Studio package (16 MB moc3, five PNG textures up to
8192×8192, ~46 MB of textures). For web delivery the following, and only the
following, was changed — the model itself is untouched (`.moc3` byte-identical):

- **moc3 / physics3 / cdi3**: copied byte-for-byte (no re-export, no edits).
- **Textures**: downscaled so the longest side is ≤ 2048 px (LANCZOS), encoded as
  WebP quality 90 (RGBA, alpha lossless-ish). 45.7 MB → 1.54 MB. Checked against the
  originals: alpha channel bit-exact, RGB PSNR over opaque pixels 38.6–49.2 dB, so
  there is no visible quality loss at the size the model is displayed.
- **preview.png / preview.webp**: the author's 852×852 thumbnail plus a 512×512 WebP
  copy used as the in-page loading placeholder (~50 KB instead of 668 KB).
- **texture_00.webp — nose artifact fix**: the author's `texture_00` atlas contains an
  isolated soft black vertical strip (original px x≈3471–3622, y≈2286–2752) that the
  nose drawable samples, so the nose renders as a black square in every non-VTube
  runtime (a known issue of this free model). The strip was made fully transparent
  (alpha = 0) before downscaling; pixel-diffing a before/after render shows the only
  changed region is the nose (≈180 px), nothing else uses that strip. The `.moc3` is
  unchanged.
- **Motions**: the 8 author motions were given ASCII filenames and grouped in
  `model3.json` as `Idle` (idle loop), `TapBody` (hand raise ⇄ default),
  `FlickHead` (big reaction), `Extra` (foxtail / finger toggles).
- **Expressions**: all 23 expressions from the author's `Exp3/` folder were given
  ASCII names.
- Unused VTube Studio files (`psd/`, `.vtube.json`, `.vbridger`, `items_pinned_to_model.json`)
  and the original PNG textures are not shipped.

### Filename mapping

Motions (`motions/`):

| Original (author) | Web name | Group |
| --- | --- | --- |
| `IDLE.motion3.json` | `idle` | Idle |
| `举手切默认手.motion3.json` | `hand_raise_to_default` | TapBody |
| `默认手切举手.motion3.json` | `hand_default_to_raise` | TapBody |
| `脱捕.motion3.json` | `big_reaction` | FlickHead |
| `狗尾草切换出来.motion3.json` | `foxtail_in` | Extra |
| `狗尾草切回默认手.motion3.json` | `foxtail_out` | Extra |
| `竖手指切出来动画.motion3.json` | `finger_up_in` | Extra |
| `竖手指切回默认.motion3.json` | `finger_up_out` | Extra |

Expressions (`expressions/`):

| Original (author) | Web name |
| --- | --- |
| `爱心眼` | `heart_eyes` |
| `单片眼镜` | `monocle` |
| `钢盆` | `steel_bowl` |
| `黑框眼镜` | `black_glasses` |
| `黑脸` | `dark_face` |
| `加载` | `loading` |
| `脸红` | `blush` |
| `流泪` | `tears` |
| `流冷汗` | `cold_sweat` |
| `默认体型` | `default_body` |
| `前倾` | `lean_forward` |
| `圈圈眼` | `spiral_eyes` |
| `裙子切换` | `skirt_toggle` |
| `竖食指关` | `finger_down` |
| `竖食指开` | `finger_up` |
| `体型1` | `body_type_1` |
| `体型2` | `body_type_2` |
| `兔牙` | `bunny_teeth` |
| `脱鞋` | `shoes_off` |
| `尾巴开关` | `tail_toggle` |
| `屑屑眼` | `smug_eyes` |
| `胸口衣服` | `chest_clothes` |
| `＞＜` | `squeeze_eyes` |

### Runtime notes

- Model canvas is 3749×7697 units (origin at 1874.5, 3848.5; PixelsPerUnit 3749).
- All five texture indices (0–4) are used by the drawables; none can be dropped.
- The `.moc3` is moc3 version 5 (`MocVersion_50`), so it needs a Cubism Core 5.x
  build (the official current `live2dcubismcore.min.js` is fine; verified: the core
  reports latest moc version 5 and loads the file). With pixi-live2d-display use the
  current official core rather than an old bundled one.
- Textures are WebP; any browser that can decode WebP is fine (all current browsers do).
- The author's reaction motions carry `Loop: true` in their metadata (as exported by
  VTube Studio), so playback loops those clips; set a one-shot loop mode in the app
  layer if you want them to play once.
- Eyes blink via the `EyeBlink` parameter group (`ParamEyeROpen` / `ParamEyeLOpen`);
  `LipSync` group is empty — drive mouth parameters yourself if needed.
