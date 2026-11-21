migrate((app) => {
  const users = app.findCollectionByNameOrId('users');
  let leads;
  try { leads = app.findCollectionByNameOrId('travel_enquiries'); } catch (_) {
    leads = new Collection({ name: 'travel_enquiries', type: 'base', listRule: null, viewRule: null, createRule: '@request.body.consent = true', updateRule: null, deleteRule: null, fields: [
      {name:'name',type:'text',required:true,max:150}, {name:'email',type:'email',required:true}, {name:'phone',type:'text',required:true,max:30}, {name:'destination',type:'text',required:true,max:200}, {name:'departure',type:'text',max:200}, {name:'travel_date',type:'text',max:30}, {name:'days',type:'number',min:1,max:90,required:true}, {name:'travellers',type:'number',min:1,max:100,required:true}, {name:'budget',type:'text',max:100}, {name:'travel_style',type:'text',max:100}, {name:'notes',type:'text',max:10000}, {name:'consent',type:'bool',required:true}, {name:'created',type:'autodate',onCreate:true}, {name:'updated',type:'autodate',onCreate:true,onUpdate:true}
    ]}); app.save(leads);
  }
  try { app.findCollectionByNameOrId('itinerary_drafts'); } catch (_) {
    app.save(new Collection({name:'itinerary_drafts',type:'base',listRule:"@request.auth.id != '' && owner = @request.auth.id",viewRule:"@request.auth.id != '' && owner = @request.auth.id",createRule:"@request.auth.id != '' && @request.body.owner = @request.auth.id",updateRule:"owner = @request.auth.id && @request.body.owner:changed = false",deleteRule:"owner = @request.auth.id",fields:[{name:'owner',type:'relation',collectionId:users.id,required:true,maxSelect:1,cascadeDelete:true},{name:'title',type:'text',required:true,max:200},{name:'content',type:'text',required:true,max:100000},{name:'created',type:'autodate',onCreate:true},{name:'updated',type:'autodate',onCreate:true,onUpdate:true}]}));
  }
}, (app) => { app.delete(app.findCollectionByNameOrId('itinerary_drafts')); app.delete(app.findCollectionByNameOrId('travel_enquiries')); });
