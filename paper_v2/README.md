# ICIEV 2026 paper — revised draft (v2)

Revised version of `../paper/` (which is kept unchanged). See `REVIEW_NOTES.md` for what changed,
how claims were verified, and what still needs confirming.

## Build on Overleaf

1. Zip this folder and upload it (New Project → Upload Project).
2. Menu → Settings → **Compiler: XeLaTeX** (needed for the Bangla text; the font is bundled in `fonts/`).
3. Main file: `main.tex`; bibliography: `references.bib` (BibTeX, style `ijcvsplatex-num`).

`\reviewversiontrue` (preamble) hides the journal's publication-only metadata for the double-blind
submission. Set it to `\reviewversionfalse` for camera-ready.

## Files

| File | Notes |
|---|---|
| `main.tex`, `references.bib` | Paper and 28 references |
| `ijcvsplatex.cls`, `ijcvsplatex-num.bst`, `LogoIJCVSP.pdf` | Official IJCVSP template files, unmodified |
| `pstcol.sty` | Shim for an obsolete package the class loads (not in current TeX Live); provides colour only |
| `figures/pipeline.tex` | TikZ source of the experimental-pipeline figure (Fig. 1), input by `main.tex` |
| `figures/*.png, *.jpg` | BUS-BRA bus_0007-l and bus_0001-l (CC BY 4.0, Zenodo 8231412); ChestX-ray8 00001170_046 via BanglaMedVQA |
| `fonts/` | Noto Serif Bengali (SIL OFL, licence included) |
| `main_preview.pdf` | Locally compiled preview (9 pages) |

All charts are drawn with pgfplots inside `main.tex`, using numbers re-computed from the result CSVs
in `BUS_BRA/`, `RadImageNet_VQA/` and `BanglaMedVQA/`.
