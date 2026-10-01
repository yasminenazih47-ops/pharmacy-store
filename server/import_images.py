"""تنزيل صور المنتجات من لينكات وتركيبها في الموقع.

1) افتحي الملف image-links.txt واكتبي فيه رقم المنتج ثم لينك الصورة (سطر لكل منتج):
       11 https://example.com/comtrex.jpg
       12 https://example.com/antiflu.png
2) شغّلي:  python3 server/import_images.py
السكربت بينزّل كل صورة في public/img/products/ باسم رقم المنتج ويربطها بالمنتج في db.json.
لازم يكون عندك نت وقت التشغيل."""
import json, os, re, sys, urllib.request

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
links_file = os.path.join(root, 'image-links.txt')
db_path = os.path.join(root, 'server', 'db.json')
img_dir = os.path.join(root, 'public', 'img', 'products')
EXT = {'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp'}

if not os.path.exists(links_file):
    sys.exit('مش لاقي image-links.txt — اعمليه في مجلد المشروع واكتبي فيه الأرقام واللينكات.')

text = open(links_file, encoding='utf-8').read()
pairs = re.findall(r'(?<![\w/])(\d{1,3})\s*[.):\-]*\s*(https?://\S+|file://\S+)', text)
db = json.load(open(db_path, encoding='utf-8'))
products = {p['id']: p for p in db['products']}
ok, failed = 0, []

for pid, url in pairs:
    pid = int(pid)
    if pid not in products:
        failed.append((pid, 'رقم منتج غير موجود')); continue
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=20) as r:
            data = r.read()
            ctype = (r.headers.get('Content-Type') or '').split(';')[0].strip().lower()
        ext = EXT.get(ctype)
        if not ext:
            m = re.search(r'\.(jpe?g|png|webp)(?:$|[?&])', url.lower())
            ext = 'jpg' if not m or m.group(1) == 'jpeg' else m.group(1)
        for e in ('jpg', 'jpeg', 'png', 'webp'):   # امسحي أي نسخة قديمة بنفس الرقم
            old = os.path.join(img_dir, f'{pid}.{e}')
            if os.path.exists(old): os.remove(old)
        with open(os.path.join(img_dir, f'{pid}.{ext}'), 'wb') as f: f.write(data)
        products[pid]['image'] = f'/img/products/{pid}.{ext}'
        ok += 1
    except Exception as e:
        failed.append((pid, str(e)))

json.dump(db, open(db_path, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(f'تم تنزيل وتركيب {ok} صورة.')
for pid, why in failed: print(f'  فشل المنتج {pid}: {why}')
