let db;

const request = indexedDB.open(
    "GunLogDB",
    1
);

request.onupgradeneeded = (event) => {

    db = event.target.result;

    db.createObjectStore(
        "records",
        {
            keyPath: "id",
            autoIncrement: true
        }
    );
};

request.onsuccess = (event) => {

    db = event.target.result;

    loadRecords();
};

document.getElementById("debug").innerHTML =
    `
    href=${window.location.href}<br>
    search=${window.location.search}<br>
    gun=${params.get("gun")}
    `;