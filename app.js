let currentGun = "UNKNOWN";

const params =
    new URLSearchParams(
        window.location.search
    );

const gun =
    params.get("gun");

if (gun) {
    currentGun = gun;
}

document.getElementById(
    "gunName"
).textContent = currentGun;

function saveRecord() {

    navigator.geolocation.getCurrentPosition(

        function(position) {

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

                gun: currentGun,

                ammo: ammo,

                lat: position.coords.latitude,

                lon: position.coords.longitude,

                accuracy: position.coords.accuracy

            });

            tx.oncomplete = () => {
                loadRecords();
            };
        },

        function(error) {

            alert(
                "GPS取得失敗: " +
                error.message
            );
        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        }
    );
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

            div.innerHTML += `
                <p>
                ${r.date}<br>
                ${r.gun}<br>
                ${r.ammo}発<br>
                緯度:${r.lat?.toFixed(6)}<br>
                経度:${r.lon?.toFixed(6)}<br>
                精度:${Math.round(r.accuracy || 0)}m
                </p>
                <hr>
            `;
        });
    };
}

document
.getElementById("saveBtn")
.addEventListener(
    "click",
    saveRecord
);