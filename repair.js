const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/devwarehouse').then(async () => {
  const pages = await mongoose.connection.db.collection('pages').find({}).toArray();
  let cleanedCount = 0;
  for (const p of pages) {
    let modified = false;
    if (Array.isArray(p.elements)) {
      const origLen = p.elements.length;
      const cleanElements = p.elements.filter(el => {
        if (!el || typeof el !== 'object') return false;
        if (typeof el.type !== 'string' || !el.type || typeof el.id !== 'string' || !el.id) return false;
        if (typeof el.x !== 'number' || isNaN(el.x)) return false;
        if (typeof el.y !== 'number' || isNaN(el.y)) return false;
        if (typeof el.width !== 'number' || isNaN(el.width)) return false;
        if (typeof el.height !== 'number' || isNaN(el.height)) return false;
        return true;
      });
      if (cleanElements.length !== origLen) {
        p.elements = cleanElements;
        modified = true;
      }
    }
    if (p.appState && typeof p.appState === 'object') {
      const appState = p.appState;
      if (typeof appState.scrollX !== 'number' || isNaN(appState.scrollX)) {
        appState.scrollX = 0;
        modified = true;
      }
      if (typeof appState.scrollY !== 'number' || isNaN(appState.scrollY)) {
        appState.scrollY = 0;
        modified = true;
      }
      if (appState.newElement) {
        delete appState.newElement;
        modified = true;
      }
    }
    if (modified) {
      await mongoose.connection.db.collection('pages').updateOne(
        { _id: p._id },
        { $set: { elements: p.elements, appState: p.appState } }
      );
      cleanedCount++;
      console.log('Sanitized MongoDB page:', p._id, 'Title:', p.title);
    }
  }
  console.log('Done repairing database. Sanitized', cleanedCount, 'pages.');
  process.exit(0);
});
