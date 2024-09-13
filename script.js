let lifts = [];
let floors = [];
let requestQueue = [];
let liftCountAtFloors = [];

document.getElementById('startBtn').addEventListener('click', function () {
    const numLifts = parseInt(document.getElementById('numLifts').value);
    const numFloors = parseInt(document.getElementById('numFloors').value);

    if (numLifts <= 0 || numFloors <= 0) {
        alert("Number of floors and lifts should be more than 0.");
        return;
    } else if (isNaN(numLifts) || isNaN(numFloors)) {
        alert("Please enter a valid number for floors and lifts.");
        return;
    }

    setupSimulation(numLifts, numFloors);
    processQueue(); 
});

function setupSimulation(numLifts, numFloors) {
    const elevatorContainer = document.getElementById('elevatorContainer');
    elevatorContainer.innerHTML = '';
    floors = [];
    lifts = [];
    requestQueue = [];
    liftCountAtFloors = new Array(numFloors).fill(0); 

    for (let i = numFloors - 1; i >= 0; i--) {
        const floor = document.createElement('div');
        floor.classList.add('floor');

        if (numFloors === 1) {
            floor.innerHTML = `
                <div class="floor-info">Floor ${i + 1}</div>
                <button class="button1" onclick="addRequestToQueue(${i}, this)">Open</button>
            `;
        } else if (i === 0) {
            floor.classList.add('ground-floor');
            floor.innerHTML = `
                <div class="floor-info">Floor ${i + 1}</div>
                <button class="button1" onclick="addRequestToQueue(${i}, this)">Up</button>
            `;
        } else if (i === numFloors - 1) {
            floor.classList.add('top-floor');
            floor.innerHTML = `
                <div class="floor-info">Floor ${i + 1}</div>
                <button class="button" onclick="addRequestToQueue(${i}, this)">Down</button>
            `;
        } else {
            floor.innerHTML = `
                <div class="floor-info">Floor ${i + 1}</div>
                <button class="button1" onclick="addRequestToQueue(${i}, this)">Up</button>
                <button class="button" onclick="addRequestToQueue(${i}, this)">Down</button>
            `;
        }

        elevatorContainer.appendChild(floor);
        floors.push(floor);
    }

    for (let i = 0; i < numLifts; i++) {
        const lift = document.createElement('div');
        lift.classList.add('elevator');
        lift.id = `lift-${i}`;

        const leftPosition = (i * 100) + 120;
        lift.style.left = `${leftPosition}px`;
        lift.style.position = 'absolute';
        lift.style.top = '0px';

        const leftDoor = document.createElement('div');
        leftDoor.classList.add('door', 'left');

        const rightDoor = document.createElement('div');
        rightDoor.classList.add('door', 'right');

        lift.appendChild(leftDoor);
        lift.appendChild(rightDoor);

        floors[floors.length - 1].appendChild(lift);

        lifts.push({ lift, currentFloor: 0, isMoving: false, doorsOpen: false, targetFloor: null });
    }
}

function addRequestToQueue(targetFloor, button) {
    if (liftCountAtFloors[targetFloor] < 2) { 
        requestQueue.push({ targetFloor, button });
        liftCountAtFloors[targetFloor]++; 

        button.disabled = true;
        button.style.backgroundColor = "#ccc"; 
    } 
}

function processQueue() {
    if (requestQueue.length === 0) {
        setTimeout(processQueue, 500); 
        return;
    }

    const { targetFloor, button } = requestQueue[0];  // Get target floor and button

    // Check for lifts at the target floor
    let liftsAtTargetFloor = lifts.filter(liftObj => liftObj.currentFloor === targetFloor && liftObj.isMoving);

    if (liftsAtTargetFloor.length < 2) { // Ensure less than 2 lifts at the target floor
        let availableLifts = lifts.filter(liftObj => !liftObj.isMoving && !liftObj.doorsOpen);

        if (availableLifts.length > 0) {
            let nearestLift = availableLifts[0]; 
            moveLift(nearestLift, targetFloor, button);  // Pass button to moveLift
            requestQueue.shift(); 
        }
    }

    setTimeout(processQueue, 500); 
}

function moveLift(liftObj, targetFloor, button) {
    if (liftObj.isMoving) return; 

    const { lift, currentFloor } = liftObj;
    const floorsToMove = targetFloor - currentFloor;
    liftObj.isMoving = true;
    liftObj.targetFloor = targetFloor;

    closeDoors(liftObj, () => {
        const timeToMove = Math.abs(floorsToMove) * 1000;

        lift.style.transition = `transform ${timeToMove}ms ease-in-out`;
        lift.style.transform = `translateY(-${targetFloor * 100}px)`;

        setTimeout(() => {
            liftObj.currentFloor = targetFloor;
            liftObj.isMoving = false;
            liftObj.targetFloor = null;

            openDoors(liftObj, button);  // Pass button to openDoors
        }, timeToMove);
    });
}

function openDoors(liftObj, button) {
    const lift = liftObj.lift;
    const leftDoor = lift.querySelector('.door.left');
    const rightDoor = lift.querySelector('.door.right');

    liftObj.doorsOpen = true;
    leftDoor.classList.add('opened');
    rightDoor.classList.add('opened');

    leftDoor.style.transform = 'translateX(-100%)';
    rightDoor.style.transform = 'translateX(100%)';

    setTimeout(() => closeDoors(liftObj, () => {
        button.disabled = false;  // Enable the button after the entire lift operation
        button.style.backgroundColor = ""; 
    }), 2500);
}

function closeDoors(liftObj, callback) {
    const lift = liftObj.lift;
    const leftDoor = lift.querySelector('.door.left');
    const rightDoor = lift.querySelector('.door.right');

    leftDoor.style.transform = 'translateX(0)';
    rightDoor.style.transform = 'translateX(0)';

    setTimeout(() => {
        leftDoor.classList.remove('opened');
        rightDoor.classList.remove('opened');
        liftObj.doorsOpen = false;
        
        liftCountAtFloors[liftObj.currentFloor]--; 
        if (callback) callback();
    }, 1000);
}
