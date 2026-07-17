
let currentGun = "UNKNOWN";

const path =
    window.location.pathname;

const gun =
    path.split("/")[1];

if (gun) {
    currentGun = gun;
}

if (gun === "m1100") {
    currentGun = "M1100";
}
else if (gun === "m2") {
    currentGun = "Benelli M2";
}
else if (gun === "mi-m2") {
    currentGun = "MI-M2";
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
            const photoInput =
            document.getElementById("photo");

            const photo =
                photoInput.files[0] || null;

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

                accuracy: position.coords.accuracy,

                photo: photo

            });

            tx.oncomplete = () => {

                document
                    .getElementById("photo")
                    .value = "";

                document
                    .getElementById("photoStatus")
                    .textContent =
                        "写真なし";

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
            let photoHtml = "";

            if (r.photo) {

                const url =
                    URL.createObjectURL(
                        r.photo
                    );

                photoHtml =
                    `<img
                        src="${url}"
                        width="200">`;
            }

            div.innerHTML += `
                <p>
                ${r.date}<br>
                ${r.gun}<br>
                ${r.ammo}発<br>
                緯度:${r.lat?.toFixed(6)}<br>
                経度:${r.lon?.toFixed(6)}<br>
                精度:${Math.round(r.accuracy || 0)}m<br>
                ${photoHtml}
                </p>
                <hr>
            `;
        });
    };
}

document
.getElementById("photo")
.addEventListener(
    "change",
    function() {

        const status =
            document.getElementById(
                "photoStatus"
            );

        if (this.files.length > 0) {

            status.textContent =
                this.files[0].name;

        } else {

            status.textContent =
                "写真なし";
        }
    }
);

document
.getElementById("saveBtn")
.addEventListener(
    "click",
    saveRecord
);
