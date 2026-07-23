function distanceMeters(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371000;

    const dLat =
        (lat2 - lat1) *
        Math.PI / 180;

    const dLon =
        (lon2 - lon1) *
        Math.PI / 180;

    const a =
        Math.sin(dLat / 2) ** 2 +

        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *

        Math.sin(dLon / 2) ** 2;

    return (
        2 *
        R *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        )
    );
}

function findRange(
    lat,
    lon
) {

    let nearest = null;

    let minDistance =
        Infinity;

    ranges.forEach(r => {

        const d =
            distanceMeters(
                lat,
                lon,
                r.lat,
                r.lon
            );

        if (
            d < minDistance
        ) {

            minDistance =
                d;

            nearest = r;
        }
    });

    if (
        nearest &&
        minDistance <=
        nearest.radius
    ) {

        return nearest.name;
    }

    return "不明";
}

let currentGun = "UNKNOWN";
//alert(window.location.pathname);
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

const rangeSelect =
    document.getElementById(
        "rangeSelect"
    );

// ドロップダウン作成
ranges.forEach(r => {

    const option =
        document.createElement(
            "option"
        );

    option.value =
        r.name;

    option.textContent =
        r.name;

    rangeSelect.appendChild(
        option
    );
});

// 起動時にGPSから自動選択
navigator.geolocation.getCurrentPosition(

    function(position) {

        const rangeName =
            findRange(
                position.coords.latitude,
                position.coords.longitude
            );

        rangeSelect.value =
            rangeName;

        console.log(
            "射撃場推定:",
            rangeName
        );
    },

    function(error) {

        console.log(
            "GPS取得失敗",
            error
        );
    }
);

function saveRecord() {
    const ammo = Number(
        document.getElementById(
            "ammo"
        ).value
    );

    if (ammo <= 0) {

        alert(
            "弾数を入力してください"
        );

        return;
    }
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
            const rangeName =
                findRange(
                    position.coords.latitude,
                    position.coords.longitude
                );
                rangeSelect.value = rangeName;
                store.add({
                    date:
                        new Date()
                        .toISOString(),
                
                    gun:
                        currentGun,
                
                    ammo:
                        ammo,
                
                    range:
                        rangeSelect.value,
                
                    photo:
                        photo,
                
                    lat:
                        position.coords.latitude,
                
                    lon:
                        position.coords.longitude,
                
                    accuracy:
                        position.coords.accuracy
                });

            tx.oncomplete = () => {
                document.getElementById(
                    "ammo"
                ).value = "";
                
                saveBtn.disabled = true;
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
            alert(
                "件数=" +
                records.length
            );

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
                ${r.range}<br>
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

const ammoInput =
    document.getElementById(
        "ammo"
    );

const saveBtn =
    document.getElementById(
        "saveBtn"
    );

ammoInput.addEventListener(
    "input",
    function() {

        const value =
            Number(this.value);

        saveBtn.disabled =
            !(value > 0);
    }
);
