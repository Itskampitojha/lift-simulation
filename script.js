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

    // Floors creation
    for (let i = numFloors - 1; i >= 0; i--) { // Create from top floor to bottom
        const floor = document.createElement('div');
        floor.classList.add('floor');
        floor.innerHTML = `
            <div class="floor-info">Floor ${i + 1}</div>
            <button class="button1" onclick="callLift(${i}, 'up')">Up</button>
            <button class="button" onclick="callLift(${i}, 'down')">Down</button>
        `;
        elevatorContainer.appendChild(floor);
        floors.push(floor);
    }

    // Lifts creation
    for (let i = 0; i < numLifts; i++) {
        const lift = document.createElement('div');
        lift.classList.add('elevator');
        lift.id = `lift-${i}`;
        
        // Set the position of each lift horizontally based on its index
        const leftPosition = (i * 100) + 100; // Adding a left margin of 20px
        lift.style.left = `${leftPosition}px`; 
    

        // Doors creation
        const leftDoor = document.createElement('div');
        leftDoor.classList.add('door', 'left');

        const rightDoor = document.createElement('div');
        rightDoor.classList.add('door', 'right');

        lift.appendChild(leftDoor);
        lift.appendChild(rightDoor);
        elevatorContainer.appendChild(lift);
        lifts.push({ lift, currentFloor: 0, isMoving: false, doorsOpen: false }); // Lift object with current floor
    }
}

function callLift(targetFloor) {
    // Find the nearest available lift
    let nearestLift = null;
    let minDistance = Infinity;

    lifts.forEach(liftObj => {
        if (!liftObj.isMoving && !liftObj.doorsOpen) { // Only consider lifts that are not moving and have doors closed
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

    // Ensure doors are closed before moving
    closeDoors(liftObj, () => {
        // Calculate time based on the number of floors to move (e.g., 1 second per floor)
        const timeToMove = Math.abs(floorsToMove) * 1000;

        // Animate lift movement only after doors are closed
        lift.style.transition = `transform ${timeToMove}ms ease-in-out`;
        lift.style.transform = `translateY(-${targetFloor * 100}px)`; // Move lift to the target floor

        // Wait for the lift to reach the target floor
        setTimeout(() => {
            // Update the current floor after the lift has reached the target floor
            liftObj.currentFloor = targetFloor;
            liftObj.isMoving = false;

            // Open doors only after lift has stopped moving and is at the correct floor
            openDoors(liftObj);
        }, timeToMove); // Delay based on time to move
    });
}

function openDoors(liftObj) {
    const lift = liftObj.lift;
    const leftDoor = lift.querySelector('.door.left');
    const rightDoor = lift.querySelector('.door.right');

    // Open doors only after lift has fully stopped
    liftObj.doorsOpen = true; // Mark doors as open
    leftDoor.classList.add('opened');
    rightDoor.classList.add('opened');

    leftDoor.style.transform = 'translateX(-100%)'; // Move left door to the left
    rightDoor.style.transform = 'translateX(100%)'; // Move right door to the right

    // Close doors after a delay (e.g., 2.5 seconds)
    setTimeout(() => closeDoors(liftObj), 2500); // Adjust delay as needed
}

function closeDoors(liftObj, callback) {
    const lift = liftObj.lift;
    const leftDoor = lift.querySelector('.door.left');
    const rightDoor = lift.querySelector('.door.right');

    leftDoor.style.transform = 'translateX(0)'; // Move left door back to its position
    rightDoor.style.transform = 'translateX(0)'; // Move right door back to its position

    setTimeout(() => {
        leftDoor.classList.remove('opened'); // Reset door state
        rightDoor.classList.remove('opened'); // Reset door state
        liftObj.doorsOpen = false; // Mark doors as closed

        if (callback) callback(); // Continue moving the lift after doors are closed
    }, 1000); // Close doors duration (1 second)
}
