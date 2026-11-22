# Logo da Maré no canto superior direito das fotos grandes dos produtos (as que abrem na página da peça).
# Lê public/img/produtos/NN-NN.webp (original, sem logo) e grava NN-NN-m.webp (com logo).
# As miniaturas (-480/-320) dos cards ficam sem logo. Rodar de novo é seguro: sempre parte do original.
# Mesmas medidas do painel (ImageCropper, opção watermark): largura 15%, margem 4,5%, opacidade 75%.
#   python scripts/marca-dagua.py
from pathlib import Path
from PIL import Image

PASTA = Path('public/img/produtos')
logo = Image.open('public/img/logo/mare.webp').convert('RGBA')

def com_logo(src: Path, dst: Path):
    im = Image.open(src).convert('RGBA')
    w, _ = im.size
    lw = round(w * 0.15)
    lh = round(logo.height * lw / logo.width)
    lg = logo.resize((lw, lh), Image.LANCZOS)
    lg.putalpha(lg.getchannel('A').point(lambda v: int(v * 0.75)))
    m = round(w * 0.045)
    im.alpha_composite(lg, (w - lw - m, m))
    im.convert('RGB').save(dst, 'WEBP', quality=86, method=6)

feitas = 0
for src in sorted(PASTA.glob('*.webp')):
    if src.stem.endswith(('-480', '-320', '-m')):
        continue
    com_logo(src, src.with_name(f'{src.stem}-m.webp'))
    feitas += 1
print(f'{feitas} fotos com logo')
