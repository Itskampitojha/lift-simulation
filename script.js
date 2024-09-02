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

    // Check for ground floor and top floor
    if (i === 0) { 
        floor.classList.add('ground-floor'); 
        floor.innerHTML = `
            <div class="floor-info">Floor ${i + 1}</div>
            <button class="button1" onclick="callLift(${i}, 'up')">Up</button>
        `;
    } else if (i === numFloors - 1) { 
        floor.classList.add('top-floor'); 
        floor.innerHTML = `
            <div class="floor-info">Floor ${i + 1}</div>
            <button class="button" onclick="callLift(${i}, 'down')">Down</button>
        `;
    } else { // Middle floors
        floor.innerHTML = `
            <div class="floor-info">Floor ${i + 1}</div>
            <button class="button1" onclick="callLift(${i}, 'up')">Up</button>
            <button class="button" onclick="callLift(${i}, 'down')">Down</button>
        `;
    }

    elevatorContainer.appendChild(floor);
    floors.push(floor);
}

    // Lifts creation
    for (let i = 0; i < numLifts; i++) {
        const lift = document.createElement('div');
        lift.classList.add('elevator');
        lift.id = `lift-${i}`;
        
        // Set the position of each lift horizontally based on its index
        const leftPosition = (i * 100) + 120; 
        lift.style.left = `${leftPosition}px`; 

        // Set the initial vertical position to the ground floor
        lift.style.position = 'absolute'; 
        lift.style.top = '0px';

        // Doors creation
        const leftDoor = document.createElement('div');
        leftDoor.classList.add('door', 'left');

        const rightDoor = document.createElement('div');
        rightDoor.classList.add('door', 'right');

        lift.appendChild(leftDoor);
        lift.appendChild(rightDoor);
        
       
        floors[floors.length - 1].appendChild(lift); 

        lifts.push({ lift, currentFloor: 0, isMoving: false, doorsOpen: false }); // Lift object with current floor
    }
}

// The rest of your functions remain unchanged (callLift, moveLift, openDoors, closeDoors)


function callLift(targetFloor) {
    // Find the nearest available lift
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
    }
}

// Ye function check karta hai ki koi doosri lift us floor par already ja rahi hai ya nahi
function isAnotherLiftGoingToFloor(targetFloor) {
    return lifts.some(lift => lift.isMoving && lift.targetFloor === targetFloor);
}

function moveLift(liftObj, targetFloor) {
    const { lift, currentFloor } = liftObj;

    // Check if this lift is already moving or if another lift is moving to the same target floor
    if (liftObj.isMoving || isAnotherLiftGoingToFloor(targetFloor)) {
        return; // Exit the function early if this lift or another lift is already moving to the target floor
    }

    const floorsToMove = targetFloor - currentFloor;
    liftObj.isMoving = true; // Set the lift's moving state to true
    liftObj.targetFloor = targetFloor; // Set the target floor for the current lift

    // Ensure doors are closed before moving
    closeDoors(liftObj, () => {
        const timeToMove = Math.abs(floorsToMove) * 1000;

        // Animate lift movement only after doors are closed
        lift.style.transition = `transform ${timeToMove}ms ease-in-out`;
        lift.style.transform = `translateY(-${targetFloor * 100}px)`; // Move lift to the target floor

        // Wait for the lift to reach the target floor
        setTimeout(() => {
            liftObj.currentFloor = targetFloor;
            liftObj.isMoving = false; // Reset the lift's moving state
            liftObj.targetFloor = null; // Clear the target floor after reaching

            // Open doors after reaching the target floor
            openDoors(liftObj);
        }, timeToMove);
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

    leftDoor.style.transform = 'translateX(-100%)'; 
    rightDoor.style.transform = 'translateX(100%)'; 

    // Close doors after a delay (e.g., 2.5 seconds)
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
