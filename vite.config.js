import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const saveDir = path.resolve(__dirname, 'saved_profiles');
if (!fs.existsSync(saveDir)) {
  fs.mkdirSync(saveDir, { recursive: true });
}

function syncServerPlugin() {
  return {
    name: 'sync-server-plugin',
    configureServer(server) {
      server.middlewares.use('/api/save-profile', (req, res) => {
        if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const profileName = (data.profileName || 'default').toLowerCase().replace(/[^a-z0-9_]/g, '');
              const filePath = path.join(saveDir, `${profileName}.json`);
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, profileName }));
            } catch (e) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: e.message }));
            }
          });
        }
      });

      server.middlewares.use('/api/load-profile', (req, res) => {
        if (req.method === 'GET') {
          const urlObj = new URL(req.url, `http://${req.headers.host}`);
          const profileName = (urlObj.searchParams.get('name') || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
          const filePath = path.join(saveDir, `${profileName}.json`);

          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(content);
          } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `Profile "${profileName}" not found on server.` }));
          }
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), syncServerPlugin()],
  base: './',
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});
