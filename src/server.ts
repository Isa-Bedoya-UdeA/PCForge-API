import { env } from './config/env.js';
import { createApp } from './app.js';
import { loadCatalogSnapshot } from './data/loader.js';
import { JsonComponentRepository } from './repositories/json-component.repository.js';

function startServer(): void {
  try {
    console.log('[pcforge-api] Loading component catalog snapshot...');
    const snapshot = loadCatalogSnapshot();
    console.log(`[pcforge-api] Loaded ${snapshot.totalCount} components across ${snapshot.byCategory.size} categories.`);

    const repository = new JsonComponentRepository(snapshot);
    const app = createApp(repository);

    app.listen(env.PORT, env.HOST, () => {
      console.log(`[pcforge-api] Server running at http://${env.HOST}:${env.PORT}`);
      console.log(`[pcforge-api] Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('[pcforge-api] Fatal startup error:', error);
    process.exit(1);
  }
}

startServer();
