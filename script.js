let lifts = [];
let floors = [];

document.getElementById('startBtn').addEventListener('click', function () {
    const numLifts = parseInt(document.getElementById('numLifts').value);
    const numFloors = parseInt(document.getElementById('numFloors').value);
    setupSimulation(numLifts, numFloors);
});

function setupSimulation(numLifts, numFloors) {
    const elevatorContainer = document.getElementById('elevatorContainer');
    elevatorContainer.innerHTML = '';
    floors = []; 
    lifts = [];  

    // Floors create karna
    for (let i = numFloors - 1; i >= 0; i--) { // Top floor se bottom tak create karenge
        const floor = document.createElement('div');
        floor.classList.add('floor');
        floor.innerHTML = `
            <div class="floor-info">Floor ${i + 1}</div>
            <button class="button" onclick="callLift(${i}, 'up')">Up</button>
            <button class="button" onclick="callLift(${i}, 'down')">Call lift</button>
        `;
        elevatorContainer.appendChild(floor);
        floors.push(floor);
    }

    // Lifts create karna
    for (let i = 0; i < numLifts; i++) {
        const lift = document.createElement('div');
        lift.classList.add('elevator');
        lift.id = `lift-${i}`;

        // Doors create karna
        const leftDoor = document.createElement('div');
        leftDoor.classList.add('door', 'left');

        const rightDoor = document.createElement('div');
        rightDoor.classList.add('door', 'right');

        lift.appendChild(leftDoor);
        lift.appendChild(rightDoor);
        elevatorContainer.appendChild(lift);
        lifts.push({ lift, currentFloor: 0, isMoving: false }); // Lift object with current floor
    }
}

function callLift(targetFloor, direction) {
    // Find the nearest available lift
    let nearestLift = null;
    let minDistance = Infinity;

    lifts.forEach(liftObj => {
        if (!liftObj.isMoving) {
            const distance = Math.abs(liftObj.currentFloor - targetFloor);
            if (distance < minDistance) {
                minDistance = distance;
                nearestLift = liftObj;
            }
        }
    });

    if (nearestLift) {
        moveLift(nearestLift, targetFloor);
    }
}

function moveLift(liftObj, targetFloor) {
    const { lift, currentFloor } = liftObj;
    const floorsToMove = targetFloor - currentFloor;

    liftObj.isMoving = true;
    liftObj.currentFloor = targetFloor;

    // Lift ko animate karna
    lift.style.transform = `translateY(-${targetFloor * 100}px)`;

    setTimeout(() => {
        openDoors(lift);
        liftObj.isMoving = false;
    }, Math.abs(floorsToMove) * 1000); // Floor ke hisaab se delay
}

function openDoors(lift) {
    const leftDoor = lift.querySelector('.door.left');
    const rightDoor = lift.querySelector('.door.right');

    leftDoor.classList.add('opened'); // Left door open and color change to pink
    rightDoor.classList.add('opened'); // Right door open and color change to pink

    leftDoor.style.transform = 'translateX(-100%)'; // Left door open
    rightDoor.style.transform = 'translateX(100%)'; // Right door open

    setTimeout(() => closeDoors(lift), 2500); // 2.5 seconds baad close
}

function closeDoors(lift) {
    const leftDoor = lift.querySelector('.door.left');
    const rightDoor = lift.querySelector('.door.right');

    leftDoor.style.transform = 'translateX(0)'; // Left door close
    rightDoor.style.transform = 'translateX(0)'; // Right door close

    // Reset door color after closing
    leftDoor.classList.remove('opened');
    rightDoor.classList.remove('opened');
}
