let lifts = [];
let floors = [];
let requestQueue = [];
let liftCountAtFloors = []; // To track the number of lifts at each floor

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
    liftCountAtFloors = new Array(numFloors).fill(0); // Initialize count for each floor

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
    // Only add to queue if less than 2 lifts are currently assigned to the target floor
    if (liftCountAtFloors[targetFloor] < 2) {
        requestQueue.push(targetFloor);
        liftCountAtFloors[targetFloor]++; // Increment lift count for the floor

        // Disable the button to prevent further requests
        button.disabled = true;

        // Allow the button to be re-enabled after all lifts have reached the floor
        setTimeout(() => {
            button.disabled = false;
        }, 5000); // Re-enable button after 5 seconds (adjust as needed)
    }
}

function processQueue() {
    if (requestQueue.length === 0) {
        setTimeout(processQueue, 500); // Check again after a delay if the queue is empty
        return;
    }

    const targetFloor = requestQueue[0];

    // Find the nearest available lift (not moving, doors closed)
    let availableLifts = lifts.filter(liftObj => !liftObj.isMoving && !liftObj.doorsOpen);

    // Limit the number of lifts to respond to the target floor
    let liftsAtTargetFloor = lifts.filter(liftObj => liftObj.currentFloor === targetFloor && liftObj.isMoving);

    if (availableLifts.length > 0 && liftsAtTargetFloor.length < 2) {
        let nearestLift = availableLifts[0]; // Simply take the first available lift
        moveLift(nearestLift, targetFloor);
        requestQueue.shift(); // Remove the processed request from the queue
        liftCountAtFloors[targetFloor]--; // Decrement lift count for the floor after moving
    }

    setTimeout(processQueue, 500); // Process the next request after a short delay
}

function moveLift(liftObj, targetFloor) {
    if (liftObj.isMoving) return; // Prevent moving if already in motion

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

        if (callback) callback();
    }, 1000);
}
