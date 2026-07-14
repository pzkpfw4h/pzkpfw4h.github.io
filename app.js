function saveRecord() {

    const ammo = Number(
        document.getElementById("ammo").value
    );

    const tx = db.transaction(
        "records",
        "readwrite"
    );

    const store =
        tx.objectStore("records");

    store.add({
        date: new Date().toISOString(),
        ammo: ammo
    });

    tx.oncomplete = () => {
        loadRecords();
    };
}

function loadRecords() {

    const tx = db.transaction(
        "records",
        "readonly"
    );

    const store =
        tx.objectStore("records");

    const req = store.getAll();

    req.onsuccess = () => {

        const records =
            req.result;

        const div =
            document.getElementById(
                "records"
            );

        div.innerHTML = "";

        records
        .slice()
        .reverse()
        .forEach(r => {

            div.innerHTML +=
                `<p>
                ${r.date}<br>
                ${r.ammo}発
                </p>`;
        });
    };
}

document
.getElementById("saveBtn")
.addEventListener(
    "click",
    saveRecord
);