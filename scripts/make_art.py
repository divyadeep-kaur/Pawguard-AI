#!/usr/bin/env python3
"""Generates the bundled illustrated pet portraits in public/img/ (original artwork, no external assets).
Run: python3 scripts/make_art.py"""
import os
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "img")
os.makedirs(OUT, exist_ok=True)

def svg(w, h, body, defs=""):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}"><defs>{defs}</defs>{body}</svg>'

def eyes(cx, cy, gap, r, mood, iris="#3b2417"):
    out = ""
    for s in (-1, 1):
        x = cx + s * gap
        out += f'<ellipse cx="{x}" cy="{cy}" rx="{r}" ry="{r*1.1}" fill="#fff"/><circle cx="{x}" cy="{cy+r*.1}" r="{r*.68}" fill="{iris}"/><circle cx="{x-r*.22}" cy="{cy-r*.2}" r="{r*.25}" fill="#fff"/>'
        if mood == "sad":
            out += f'<path d="M{x-r*1.3} {cy-r*1.35} Q{x} {cy-r*1.1} {x+s*r*1.3} {cy-r*1.8}" stroke="#3a2a22" stroke-width="{r*.28}" fill="none" stroke-linecap="round"/>'
    return out

def dog(fur, fur2, bg1, bg2, mood="happy", collar=None, patch=True):
    sad = mood == "sad"
    d = f'<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{bg1}"/><stop offset="1" stop-color="{bg2}"/></linearGradient>'
    b = '<rect width="600" height="450" fill="url(#g)"/>'
    b += '<ellipse cx="300" cy="440" rx="330" ry="70" fill="#000" opacity=".08"/>'
    if sad:
        for i in range(14): b += f'<line x1="{30+i*42}" y1="{(i*53)%260}" x2="{22+i*42}" y2="{(i*53)%260+34}" stroke="#fff" stroke-width="2" opacity=".35"/>'
    else:
        b += '<circle cx="500" cy="90" r="46" fill="#fff" opacity=".55"/><circle cx="500" cy="90" r="30" fill="#fde68a"/>'
    b += f'<ellipse cx="300" cy="470" rx="210" ry="150" fill="{fur}"/>'  # shoulders
    if collar: b += f'<path d="M165 372 Q300 430 435 372 L440 396 Q300 462 160 396Z" fill="{collar}"/><circle cx="300" cy="430" r="15" fill="#fbbf24" stroke="#d97706" stroke-width="3"/>'
    b += f'<ellipse cx="170" cy="215" rx="58" ry="105" fill="{fur2}" transform="rotate(14 170 215)"/><ellipse cx="430" cy="215" rx="58" ry="105" fill="{fur2}" transform="rotate(-14 430 215)"/>'
    b += f'<ellipse cx="300" cy="228" rx="142" ry="130" fill="{fur}"/>'
    if patch: b += f'<ellipse cx="372" cy="200" rx="56" ry="62" fill="{fur2}" opacity=".85"/>'
    b += '<ellipse cx="300" cy="288" rx="82" ry="64" fill="#f6e7d6"/>'
    b += eyes(300, 205, 62, 21, mood)
    b += '<ellipse cx="300" cy="258" rx="31" ry="21" fill="#2a1d18"/><ellipse cx="292" cy="252" rx="8" ry="4" fill="#fff" opacity=".5"/>'
    b += '<path d="M300 279 L300 300" stroke="#2a1d18" stroke-width="4"/>'
    if sad: b += '<path d="M268 318 Q300 304 332 318" stroke="#2a1d18" stroke-width="4" fill="none" stroke-linecap="round"/>'
    else: b += '<path d="M268 304 Q300 336 332 304" stroke="#2a1d18" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M286 318 Q300 352 314 318Z" fill="#f87171"/>'
    if sad: b += '<rect x="228" y="108" width="74" height="22" rx="8" fill="#f4e4c8" transform="rotate(-18 265 119)"/><line x1="250" y1="106" x2="248" y2="132" stroke="#e5cfa6" stroke-width="3" transform="rotate(-18 265 119)"/><line x1="268" y1="106" x2="266" y2="132" stroke="#e5cfa6" stroke-width="3" transform="rotate(-18 265 119)"/>'
    return svg(600, 450, b, d)

def cat(fur, fur2, bg1, bg2, mood="happy", eye="#4ade80", collar=None):
    sad = mood == "sad"
    d = f'<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{bg1}"/><stop offset="1" stop-color="{bg2}"/></linearGradient>'
    b = '<rect width="600" height="450" fill="url(#g)"/><ellipse cx="300" cy="440" rx="330" ry="70" fill="#000" opacity=".08"/>'
    if not sad: b += '<circle cx="95" cy="95" r="40" fill="#fff" opacity=".5"/>'
    b += f'<ellipse cx="300" cy="480" rx="200" ry="150" fill="{fur}"/>'
    if collar: b += f'<path d="M180 375 Q300 425 420 375 L424 398 Q300 456 176 398Z" fill="{collar}"/>'
    b += f'<polygon points="165,150 190,40 270,115" fill="{fur}"/><polygon points="435,150 410,40 330,115" fill="{fur}"/><polygon points="187,128 198,70 244,115" fill="#f9a8b8"/><polygon points="413,128 402,70 356,115" fill="#f9a8b8"/>'
    b += f'<ellipse cx="300" cy="238" rx="150" ry="125" fill="{fur}"/>'
    b += f'<path d="M300 113 L282 160 L318 160Z" fill="{fur2}"/><path d="M232 130 L250 168 L220 170Z" fill="{fur2}" opacity=".8"/><path d="M368 130 L350 168 L380 170Z" fill="{fur2}" opacity=".8"/>'
    b += '<ellipse cx="300" cy="292" rx="70" ry="52" fill="#fbf1e6"/>'
    for s in (-1, 1):
        x = 300 + s * 62
        b += f'<ellipse cx="{x}" cy="220" rx="26" ry="{22 if not sad else 17}" fill="{eye}"/><ellipse cx="{x}" cy="220" rx="8" ry="{20 if not sad else 15}" fill="#14221a"/><circle cx="{x-8}" cy="212" r="6" fill="#fff"/>'
        if sad: b += f'<path d="M{x-30} {190} Q{x} {196} {x+s*30} {182}" stroke="#3a2a22" stroke-width="5" fill="none" stroke-linecap="round"/>'
    b += '<path d="M286 262 L314 262 L300 280Z" fill="#f472b6"/><path d="M300 280 L300 296" stroke="#5b4339" stroke-width="3"/>'
    if sad: b += '<path d="M276 312 Q300 300 324 312" stroke="#5b4339" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
    else: b += '<path d="M274 296 Q287 314 300 296 Q313 314 326 296" stroke="#5b4339" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
    for s in (-1, 1):
        for k, dy in enumerate((-8, 6, 20)):
            b += f'<line x1="{300+s*50}" y1="{286+k*0+dy*0.6}" x2="{300+s*140}" y2="{276+dy*1.4}" stroke="#fff" stroke-width="2.5" opacity=".9"/>'
    if sad: b += '<ellipse cx="205" cy="212" rx="14" ry="20" fill="#bfe3ff" opacity=".0"/>'
    return svg(600, 450, b, d)

def cow(bg1, bg2, mood="happy"):
    sad = mood == "sad"
    d = f'<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{bg1}"/><stop offset="1" stop-color="{bg2}"/></linearGradient>'
    b = '<rect width="600" height="450" fill="url(#g)"/>'
    b += '<path d="M0 340 Q150 290 300 335 T600 320 V450 H0Z" fill="#86c56a" opacity="%s"/>' % (".45" if sad else ".9")
    b += '<ellipse cx="300" cy="470" rx="230" ry="130" fill="#f5f1ea"/><ellipse cx="190" cy="430" rx="60" ry="40" fill="#3a3330"/>'
    b += '<path d="M178 120 Q140 70 112 92" stroke="#e9dcc0" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M422 120 Q460 70 488 92" stroke="#e9dcc0" stroke-width="22" fill="none" stroke-linecap="round"/>'
    b += '<ellipse cx="150" cy="190" rx="62" ry="32" fill="#3a3330" transform="rotate(-20 150 190)"/><ellipse cx="450" cy="190" rx="62" ry="32" fill="#3a3330" transform="rotate(20 450 190)"/><ellipse cx="152" cy="194" rx="34" ry="14" fill="#f4a9a8" transform="rotate(-20 152 194)"/><ellipse cx="448" cy="194" rx="34" ry="14" fill="#f4a9a8" transform="rotate(20 448 194)"/>'
    b += '<ellipse cx="300" cy="220" rx="128" ry="135" fill="#f5f1ea"/><path d="M215 120 Q260 90 300 130 Q250 175 200 165Z" fill="#3a3330"/><ellipse cx="385" cy="205" rx="40" ry="52" fill="#3a3330" opacity=".92"/>'
    b += eyes(300, 205, 60, 19, mood, "#2a1d18")
    b += '<ellipse cx="300" cy="305" rx="92" ry="70" fill="#f7b7b3"/><ellipse cx="268" cy="298" rx="14" ry="19" fill="#b9615e"/><ellipse cx="332" cy="298" rx="14" ry="19" fill="#b9615e"/>'
    b += ('<path d="M270 340 Q300 326 330 340" stroke="#9b4f4c" stroke-width="4" fill="none" stroke-linecap="round"/>' if sad else '<path d="M268 332 Q300 358 332 332" stroke="#9b4f4c" stroke-width="4" fill="none" stroke-linecap="round"/>')
    if not sad: b += '<path d="M430 350 q-18 -22 0 -34 q18 12 0 34z" fill="#ef4444"/>'
    return svg(600, 450, b, d)

art = {
 "pet-buddy": dog("#c98b4f", "#8a5a2e", "#cfe9e4", "#9fd0c7", collar="#0f766e"),
 "pet-luna": cat("#e3a35e", "#b86f2c", "#fde7c8", "#f6c98d", collar="#f43f5e"),
 "pet-coco": dog("#e8c47a", "#cf9f4e", "#e4def5", "#bdb2e6", collar="#f43f5e", patch=False),
 "pet-sheru": dog("#a9703e", "#5e3b1f", "#d7ecd2", "#a9d6a0", collar="#2563eb"),
 "story-rocky-before": dog("#a37a52", "#6d4b2e", "#aeb9c2", "#7d8a94", mood="sad"),
 "story-rocky-after": dog("#c58a52", "#8a5a2e", "#fde9c9", "#f7c98b", collar="#0f766e"),
 "story-nandi-before": cow("#b6c0c7", "#8c99a3", mood="sad"),
 "story-nandi-after": cow("#cfe8f7", "#a7d3ee"),
 "story-kiku-before": cat("#9a9490", "#6f6a66", "#b3bcc4", "#7f8b94", mood="sad", eye="#a3b59a"),
 "story-kiku-after": cat("#f0ede8", "#cfc6bb", "#fde2e8", "#f9bcc9", eye="#7dd3fc", collar="#6366f1"),
}
for name, content in art.items():
    open(os.path.join(OUT, name + ".svg"), "w").write(content)
print("wrote", len(art), "images to", os.path.abspath(OUT))
