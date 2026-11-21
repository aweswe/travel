migrate((app) => {
  try { app.findCollectionByNameOrId('contact_messages'); } catch (_) {
    app.save(new Collection({ name: 'contact_messages', type: 'base', listRule: null, viewRule: null, createRule: '@request.body.consent = true', updateRule: null, deleteRule: null, fields: [
      {name:'name',type:'text',required:true,max:150},
      {name:'email',type:'email',required:true},
      {name:'phone',type:'text',max:30},
      {name:'subject',type:'text',max:200},
      {name:'message',type:'text',required:true,max:5000},
      {name:'consent',type:'bool',required:true},
      {name:'created',type:'autodate',onCreate:true},
      {name:'updated',type:'autodate',onCreate:true,onUpdate:true}
    ]}));
  }
}, (app) => { try { app.delete(app.findCollectionByNameOrId('contact_messages')); } catch (_) {} });
