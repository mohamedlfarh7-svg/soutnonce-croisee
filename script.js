const workerForm = document.getElementById('worker-form');
const saveWorkerBtn = document.getElementById('save-worker');
const closeFormBtn = document.getElementById('close-form');
const addWorkerBtn = document.getElementById('add-worker');
const employeeList = document.querySelector('.employee-list');
const workerModal = document.getElementById('modal');

const names = document.getElementById('name');
const photo = document.getElementById('photo');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const role = document.getElementById('role');

const expContainer = document.getElementById('experiences');
const addExpBtn = document.getElementById('addExperience');

const zone = document.querySelectorAll('.zone');
const add = document.querySelectorAll('.add');

const selectWorkerModal = document.getElementById("selectWorkerModal");
const workerSelect = document.getElementById("workerSelect");
const closeSelectWorker = document.getElementById("closeSelectWorker");
const addSelectedWorker = document.getElementById("addSelectedWorker");

let addwork = JSON.parse(localStorage.getItem('workers')) || [];
let selectedZone = "";

function updateUI() {
    localStorage.setItem("workers", JSON.stringify(addwork));
    showworkers();
    showZoneWorkers();
    showZoneCounts();
}

function canAssign(role, zone) {
    if (zone.includes("Reception")) return role === 'Receptionist' || role === 'Manager';
    if (zone.includes("Security")) return role === 'Security' || role === 'Manager';
    if (zone.includes("Archive")) return role !== 'Cleaning';
    if (zone.includes("Server Room")) return role === 'Technician IT' || role === 'Manager';
    return true;
}

addWorkerBtn.addEventListener('click', () => workerModal.style.display = 'flex');

closeFormBtn.addEventListener('click', () => {
    workerModal.style.display = 'none';
    workerForm.reset();
    expContainer.innerHTML = ''; 
});

closeSelectWorker.addEventListener('click', () => {
    selectWorkerModal.style.display = "none";
});

addExpBtn.addEventListener('click', () => {
    const expDiv = document.createElement('div');
    expDiv.classList.add('exp-item');
    expDiv.innerHTML = `
        <input type="text" placeholder="Poste" class="exp-role" required>
        <input type="text" placeholder="Entreprise" class="exp-company" required>
        <input type="date" placeholder="Début" class="exp-start" required>
        <input type="date" placeholder="Fin" class="exp-end" required>
        <button type="button" class="remove-exp">Supprimer</button>
    `;
    expContainer.appendChild(expDiv);

    expDiv.querySelector('.remove-exp').addEventListener('click', () => {
        expDiv.remove();
    });
});

saveWorkerBtn.addEventListener('click', e => {
    e.preventDefault();
    if (!names.value.trim() || !email.value || !role.value || !phone.value) {
        alert("Veuillez remplir tous les champs principaux");
        return;
    }

    const experiences = [];
    document.querySelectorAll('.exp-item').forEach(exp => {
        const start = exp.querySelector('.exp-start').value;
        const end = exp.querySelector('.exp-end').value;
        if(start && end && start > end) {
            alert("La date de début doit être avant la date de fin !");
            throw "Invalid dates";
        }
        experiences.push({
            role: exp.querySelector('.exp-role').value,
            company: exp.querySelector('.exp-company').value,
            start,
            end
        });
    });

    addwork.push({
        id: Date.now(),
        name: names.value,
        photo: photo.value,
        email: email.value,
        phone: phone.value,
        role: role.value,
        experiences,
        assignedZone: null
    });

    workerForm.reset();
    expContainer.innerHTML = '';
    workerModal.style.display = 'none';
    updateUI();
});

function showworkers() {
    employeeList.innerHTML = '';
    const unassigned = addwork.filter(w => !w.assignedZone);
    if(unassigned.length === 0) {
        employeeList.style.display = 'none';
        return;
    }
    employeeList.style.display = 'flex';
    unassigned.forEach(worker => {
        employeeList.innerHTML += `
            <div class="employee-card" onclick="showInfo(${worker.id})">
                <img src="${worker.photo}">
                <div class="info">
                    <p class="name">${worker.name}</p>
                    <p class="role">${worker.role}</p>
                </div>
                <button onclick="deleteWorker(${worker.id})" class="remove">X</button>
            </div>
        `;
    });
}

function deleteWorker(id) {
    const index = addwork.findIndex(w => w.id === id);
    if(index !== -1) addwork.splice(index,1);
    updateUI();
}

add.forEach(btn => {
    btn.addEventListener("click", () => {
        const zoneDiv = btn.parentElement;
        selectedZone = zoneDiv.querySelector("h3").textContent;
        loadWorkersInSelect();
        selectWorkerModal.style.display = "flex";
    });
});

function loadWorkersInSelect() {
    workerSelect.innerHTML = `<option value="">-- Sélectionner un employé --</option>`;
    addwork.forEach(w => {
        if (!w.assignedZone && canAssign(w.role, selectedZone)) {
            workerSelect.innerHTML += `<option value="${w.id}">${w.name} - (${w.role})</option>`;
        }
    });
}

addSelectedWorker.addEventListener('click', () => {
    const selectedId = parseInt(workerSelect.value);
    if (!selectedId) return alert("Veuillez sélectionner un employé");

    const w = addwork.find(w => w.id === selectedId);
    if(w) {
        assignWorker(w, selectedZone);
        updateUI();
        selectWorkerModal.style.display = "none";
    }
});

function showZoneWorkers() {
    zone.forEach(z => {
        const zoneName = z.querySelector("h3").textContent;
        z.querySelectorAll(".employee-card").forEach(e => e.remove());

        addwork.forEach(worker => {
            if (worker.assignedZone === zoneName) {
                const card = document.createElement('div');
                card.classList.add('employee-card');

                card.innerHTML = `
                    <img src="${worker.photo}">
                    <div class="info">
                        <p class="name">${worker.name}</p>
                        <p class="role">${worker.role}</p>
                    </div>
                    <button onclick="deleteWorkerFromZone(${worker.id})" class="remove">X</button>
                `;

                z.appendChild(card);
            }
        });
    });
}

function deleteWorkerFromZone(id) {
    const w = addwork.find(w => w.id === id);
    if(w) {
        w.assignedZone = null;
        updateUI();
    }
};

const workerInfoModal = document.querySelector('#workerInfoModal');
function showInfo(id) {
    const w = addwork.find(w => w.id === id);
    if (!w) return;
    workerInfoModal.style.display= 'flex';

    const closeWorkerInfo = document.querySelector("#closeWorkerInfo").addEventListener('click',()=>{workerInfoModal.style.display= 'none';})
    document.getElementById('workerInfoPhoto').src = w.photo;
    document.getElementById('workerInfoName').textContent = w.name;
    document.getElementById('workerInfoRole').textContent = "Role: " + w.role;
    document.getElementById('workerInfoEmail').textContent = "Email: " + w.email;
    document.getElementById('workerInfoPhone').textContent = "Téléphone: " + w.phone;

    const expList = document.getElementById('workerInfoExp');
    expList.innerHTML='';
    w.experiences.forEach(exp=> {
        expList.innerHTML +=`
            <li>${exp.role} chez ${exp.company} <br> (${exp.start} - ${exp.end})</li>
        `
    });
}
const zoneLimits = {
    "Zone 1 - Conference Room": 8,
    "Zone 2 - Reception": 2,
    "Zone 3 - Server Room": 3,
    "Zone 4 - Security": 3,
    "Zone 5 - Staff Room": 10,
    "Zone 6 - Archive": 4
};
function canAddToZone(zoneName) {
    const currentWorkers = addwork.filter(w => w.assignedZone === zoneName).length;
    const max = zoneLimits[zoneName];

    return currentWorkers < max;
}
function assignWorker(worker, zoneName) {
    if (!canAddToZone(zoneName)) {
        alert("Cette zone a atteint le nombre maximum d'employés !");
        selectWorkerModal.style.display='none';
        return;
    }

    worker.assignedZone = zoneName;
    updateUI();
    showZoneCounts();
}
function showZoneCounts() {
    zone.forEach(z => {
        const zoneName = z.querySelector("h3").textContent;
        const current = addwork.filter(w => w.assignedZone === zoneName).length;
        const max = zoneLimits[zoneName];

        let counter = z.querySelector(".zone-counter");
        if (!counter) {
            counter = document.createElement("div");
            counter.className = "zone-counter";
            z.prepend(counter);
        }
        counter.textContent = `${current} / ${max}`;
    });
}


updateUI();