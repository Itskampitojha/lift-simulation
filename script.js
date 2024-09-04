let lifts = [];
let floors = [];
let requestQueue = [];
let activeRequests = {};

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
    processQueue(); // Start processing the queue automatically
});

function setupSimulation(numLifts, numFloors) {
    const elevatorContainer = document.getElementById('elevatorContainer');
    elevatorContainer.innerHTML = '';
    floors = [];
    lifts = [];
    requestQueue = [];
    activeRequests = {};

    for (let i = numFloors - 1; i >= 0; i--) {
        const floor = document.createElement('div');
        floor.classList.add('floor');

        if (numFloors === 1) {
            // If there's only one floor, use "Open Lift" button
            floor.innerHTML = `
                <div class="floor-info">Floor ${i + 1}</div>
                <button class="button1" onclick="addRequestToQueue(${i})">Open</button>
            `;
        } else if (i === 0) {
            floor.classList.add('ground-floor');
            floor.innerHTML = `
                <div class="floor-info">Floor ${i + 1}</div>
                <button class="button1" onclick="addRequestToQueue(${i})">Up</button>
            `;
        } else if (i === numFloors - 1) {
            floor.classList.add('top-floor');
            floor.innerHTML = `
                <div class="floor-info">Floor ${i + 1}</div>
                <button class="button" onclick="addRequestToQueue(${i})">Down</button>
            `;
        } else {
            floor.innerHTML = `
                <div class="floor-info">Floor ${i + 1}</div>
                <button class="button1" onclick="addRequestToQueue(${i})">Up</button>
                <button class="button" onclick="addRequestToQueue(${i})">Down</button>
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

function addRequestToQueue(targetFloor) {
    // Prevent multiple requests for the same floor
    if (!activeRequests[targetFloor]) {
        activeRequests[targetFloor] = true;
        requestQueue.push(targetFloor);
    }
}

function processQueue() {
    if (requestQueue.length === 0) {
        setTimeout(processQueue, 500); // Check again after a delay if the queue is empty
        return;
    }

    const targetFloor = requestQueue[0];

    let nearestLift = null;
    let minDistance = Infinity;

    lifts.forEach(liftObj => {
        if (!liftObj.isMoving && !liftObj.doorsOpen) {
            const distance = Math.abs(liftObj.currentFloor - targetFloor);
            if (distance < minDistance) {
                minDistance = distance;
                nearestLift = liftObj;
            }
        }
    });

    if (nearestLift) {
        moveLift(nearestLift, targetFloor);
        requestQueue.shift();
    }

    setTimeout(processQueue, 500); // Process the next request after a short delay
}

function moveLift(liftObj, targetFloor) {
    if (liftObj.isMoving || isAnotherLiftGoingToFloor(targetFloor)) return;

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

            openDoors(liftObj);
        }, timeToMove);
    });
}

function openDoors(liftObj) {
    const lift = liftObj.lift;
    const leftDoor = lift.querySelector('.door.left');
    const rightDoor = lift.querySelector('.door.right');

    liftObj.doorsOpen = true;
    leftDoor.classList.add('opened');
    rightDoor.classList.add('opened');

    leftDoor.style.transform = 'translateX(-100%)';
    rightDoor.style.transform = 'translateX(100%)';

    setTimeout(() => closeDoors(liftObj), 2500);
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

        // Mark the request for this floor as completed
        activeRequests[liftObj.currentFloor] = false;

        if (callback) callback();
    }, 1000);
}

function isAnotherLiftGoingToFloor(targetFloor) {
    return lifts.some(lift => lift.isMoving && lift.targetFloor === targetFloor);
}
