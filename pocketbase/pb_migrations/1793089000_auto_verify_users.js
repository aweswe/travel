migrate((app) => {
  const users = app.findCollectionByNameOrId('users');
  let records = [];
  try {
    records = app.findRecordsByFilter(users.id, 'verified = false', '', 500, 0);
  } catch (_) {
    records = [];
  }
  for (const record of records) {
    try {
      record.set('verified', true);
      app.save(record);
    } catch (_) {}
  }
}, (app) => {});
