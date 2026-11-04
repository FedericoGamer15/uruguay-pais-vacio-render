# Estado de Producción — Por qué el país más habitable de Sudamérica está casi vacío

- **Estado actual:** `CONCLUIDO`
- **Título elegido:** *Por qué el país más habitable de Sudamérica está casi vacío*
- **Miniatura elegida:** *Concepto 1 — "El Fuego Solitario en la Oscuridad" (Estilo RealLifeLore / Mapa Nocturno)*
- **Formato:** `1920 × 1080` (16:9 Documental YouTube), `30 fps`
- **Duración final medida:** `556.07 segundos` (`09m 16s` = `16.680 fotogramas` exactos)
- **Tamaño del MP4 final:** `244.46 MB` (`h264` + `aac` normalizado a `-14 LUFS`, True Peak `-1.5 dBTP`)

## Entregables verificados
- [x] `roteiro.md` — Guion técnico-literario completo y tabla cronológica de 7 columnas.
- [x] `scene-plan.ts` y `src/data/scenes.ts` — Contrato de datos con las 15 escenas sincronizadas con Fish Audio (`src/data/vo.json`).
- [x] `public/audio/vo/s1.wav` .. `s15.wav` — 15 pistas de locución generadas con **Fish Audio (`--provider fish`)** y normalizadas a `-17 dB RMS`.
- [x] `public/audio/sfx/*.wav` y `public/audio/music.wav` — 28 efectos de sonido y banda sonora documental de 556 s con sidechain/ducking automático.
- [x] `out/sheet.png` — Hoja de contacto con los 16 fotogramas clave inspeccionados visualmente.
- [x] `out/thumbnail-concepto-1.png` — Miniatura de YouTube en alta resolución (`1920 × 1080`).
- [x] `out/uruguay-pais-vacio.mp4` — Videoensayo documental completo unido (`part_0` de Colab + `part_1`, `part_2`, `part_3` locales) y normalizado con `loudnorm.py` y verificado con `ffprobe` y `audiocheck.py`.
