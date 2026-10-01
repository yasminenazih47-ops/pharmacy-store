# Shifa Pharmacy | صيدلية شفاء

React + Bootstrap + json-server. 154 products in 16 categories.

## Run
```
npm install
npm start        # runs json-server (3001) and vite (5173) together
```
Open http://localhost:5173

## Demo accounts
- Admin: admin@pharma.com / Admin123
- User: user@pharma.com / User1234

## Notes
- Put the pharmacy number in `src/config.js` (WHATSAPP) and your team in TEAM.
- Product images are in `public/img/products/<id>.svg`. To use real photos, add files to `public/img/` and change the `image` field in `server/db.json`, or upload from Dashboard > Products > Edit.
- `server/gen.py` regenerates the database and images (python3 server/gen.py). It resets orders and users.
- Passwords are plain text because this is a fake API for training only.
