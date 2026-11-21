/// <reference path="../pb_data/types.d.ts" />

onRecordAfterCreateSuccess((e) => {
    try {
        e.record.set("verified", true);
        e.app.save(e.record);
    } catch (err) {
        console.error("Auto verify failed:", err);
    }
    return e.next();
}, "users")
