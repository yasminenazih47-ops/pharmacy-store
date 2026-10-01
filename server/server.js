// سيرفر واحد للنشر: الموقع (dist) + الـ API تحت /api
import jsonServer from 'json-server';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(__dirname, '../dist');
const app = jsonServer.create();

app.use(jsonServer.defaults({ static: dist, logger: false }));
app.use('/api', jsonServer.router(path.join(__dirname, 'db.json')));
app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));

const port = process.env.PORT || 3001;
app.listen(port, () => console.log('Running on port ' + port));
