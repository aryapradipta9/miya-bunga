// document.getElementById("app").innerHTML = `
// <h1>Hello Vanilla!</h1>
// <div>
//   We use the same configuration as Parcel to bundle this sandbox, you can find more
//   info about Parcel
//   <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>.
// </div>
// `;

// Math

function getVectorFromTwoPoints(point1, point2) {
  return {
    x: point2.x - point1.x,
    y: point2.y - point1.y,
  };
}

function getDistanceBetweenPoints(point1, point2) {
  const x = point1.x - point2.x;
  const y = point1.y - point2.y;

  return Math.sqrt(x * x + y * y);
}

// Animation constants

const FRAME_DURATION = 1000 / 30; // 60fps frame duration ~16.66ms
const getTime = typeof performance === 'function' ? performance.now : Date.now;

// Global requestAnimationFrame ID so we can cancel it when user clicks on "Draw again"
let rafID;

// Function to animate line drawing
function drawLine(
  startPoint,
  endPoint,
  drawingSpeed = 5,
  onAnimationEnd,
  startingLength = 0,
  multiStartPoint = [],
  multiEndPoint
) {
  let lastUpdate = getTime();

  // Set initial state
  let currentPoint = startPoint;
  const vector = getVectorFromTwoPoints(startPoint, endPoint);
  const startToEndDistance = getDistanceBetweenPoints(startPoint, endPoint);

  const lineStep = drawingSpeed / startToEndDistance;

  let vectorStep = {
    x: vector.x * lineStep,
    y: vector.y * lineStep,
  };

  // multiple version
  let multiCurrentPoint = [];
  let multiVector = [];
  let multiStartToEndDistance = [];
  let multiLineStep = [];
  let multiVectorStep = [];

  for (let i = 0; i < multiStartPoint.length; i++) {
    multiCurrentPoint.push(multiStartPoint[i]);
    multiVector.push(
      getVectorFromTwoPoints(multiStartPoint[i], multiEndPoint[i])
    );
    multiStartToEndDistance.push(
      getDistanceBetweenPoints(multiStartPoint[i], multiEndPoint[i])
    );
    multiLineStep.push(drawingSpeed / multiStartToEndDistance[i]);
    multiVectorStep.push({
      x: multiVector[i].x * multiLineStep[i],
      y: multiVector[i].y * multiLineStep[i],
    });
  }

  const animate = () => {
    const now = getTime();
    const delta = (now - lastUpdate) / FRAME_DURATION;

    const deltaVector = {
      x: vectorStep.x * delta,
      y: vectorStep.y * delta,
    };

    // // Add starting length if any
    // if (startingLength) {
    //   const startingLengthFactor = startingLength / startToEndDistance;

    //   deltaVector.x += vector.x * startingLengthFactor;
    //   deltaVector.y += vector.y * startingLengthFactor;

    //   // We've drawn it once, we don't want to draw it again
    //   startingLength = 0;
    // }

    // Set next point
    let nextPoint = {
      x: currentPoint.x + deltaVector.x,
      y: currentPoint.y + deltaVector.y,
    };

    let newStartingLength = 0;
    let isFinished = false;

    const startToNextPointDistance = getDistanceBetweenPoints(
      startPoint,
      nextPoint
    );

    // The next point is past the end point
    if (startToNextPointDistance >= startToEndDistance) {
      // newStartingLength = startToNextPointDistance - startToEndDistance;
      isFinished = true;
      nextPoint = endPoint;
    }

    // Draw line segment
    ctx.beginPath();
    ctx.strokeStyle = startPoint.color;

    ctx.moveTo(currentPoint.x, currentPoint.y);

    // ctx.bezierCurveTo(
    //   currentPoint.x,
    //   currentPoint.y,
    //   endPoint.x,
    //   currentPoint.y,
    //   endPoint.x,
    //   endPoint.y
    // );
    ctx.stroke();
    ctx.closePath();

    // opposite side
    ctx.beginPath();
    ctx.moveTo(currentPoint.x, currentPoint.y);
    // ctx.bezierCurveTo(
    //   currentPoint.x,
    //   currentPoint.y,
    //   startPoint.x,
    //   currentPoint.y,
    //   startPoint.x,
    //   startPoint.y
    // );
    ctx.stroke();
    ctx.closePath();

    // if (isFinished) {
    //   if (onAnimationEnd) {
    //     onAnimationEnd(newStartingLength);
    //   }
    //   return;
    // }

    // Move current point to the end of the drawn segment
    currentPoint = nextPoint;

    // multi
    let deltaVectorm = [];
    let nextPointm = [];
    for (let i = 0; i < multiStartPoint.length; i++) {
      deltaVectorm.push({
        x: multiVectorStep[i].x * delta,
        y: multiVectorStep[i].y * delta,
      });
      nextPointm.push({
        x: multiCurrentPoint[i].x + deltaVectorm[i].x,
        y: multiCurrentPoint[i].y + deltaVectorm[i].y,
      });

      let newStartingLengthm = 0;
      let isFinishedm = false;

      const startToNextPointDistancem = getDistanceBetweenPoints(
        multiStartPoint[0],
        nextPointm[0]
      );

      // The next point is past the end point
      if (startToNextPointDistancem >= multiStartToEndDistance[0]) {
        isFinishedm = true;
        nextPointm[i] = multiEndPoint[i];
      }

      // Draw line segment
      ctx.beginPath();
      ctx.strokeStyle = multiStartPoint[i].color;

      ctx.moveTo(multiCurrentPoint[i].x, multiCurrentPoint[i].y);

      ctx.bezierCurveTo(
        multiCurrentPoint[i].x,
        multiCurrentPoint[i].y,
        multiEndPoint[i].x,
        multiCurrentPoint[i].y,
        multiEndPoint[i].x,
        multiEndPoint[i].y
      );
      ctx.stroke();
      ctx.closePath();

      // opposite side
      ctx.beginPath();
      ctx.moveTo(multiCurrentPoint[i].x, multiCurrentPoint[i].y);
      ctx.bezierCurveTo(
        multiCurrentPoint[i].x,
        multiCurrentPoint[i].y,
        multiStartPoint[i].x,
        multiCurrentPoint[i].y,
        multiStartPoint[i].x,
        multiStartPoint[i].y
      );
      ctx.stroke();
      ctx.closePath();

      if (isFinishedm) {
        if (onAnimationEnd) {
          onAnimationEnd(newStartingLength);
        }
        return;
      }

      // Move current point to the end of the drawn segment
      multiCurrentPoint[i] = nextPointm[i];
    }

    // Update last updated time
    lastUpdate = now;

    // Store requestAnimationFrame ID so we can cancel it
    rafID = requestAnimationFrame(animate);
  };

  // Start animation
  animate();
}

function drawPolygon(
  vertices,
  drawingSpeed = 5,
  onAnimationEnd,
  multiVertices = [],
  startingLength = 0,
  startingPointIndex = 0
) {
  // const start = vertices[startingPointIndex];
  // const end = vertices[startingPointIndex + 1];
  const start = {};
  const end = {};

  if (startingPointIndex >= multiVertices.length) {
    if (onAnimationEnd) {
      onAnimationEnd();
    }
    return;
  }
  drawLine(
    start,
    end,
    drawingSpeed,
    (startingLength) => {
      const newIndex = startingPointIndex + 1;
      ctx.translate(300, 300);
      ctx.rotate((22.5 * Math.PI) / 180);
      ctx.translate(-300, -300);

      drawPolygon(
        vertices,
        drawingSpeed,
        onAnimationEnd,
        multiVertices,
        startingLength,
        newIndex
      );
    },
    startingLength,
    multiVertices[startingPointIndex][0],
    multiVertices[startingPointIndex][1]
  );
}

// Demo

const vertices = [
  // { x: 600, y: 0, color: "darkred" },
  // { x: 300, y: 300 }
  // { x: 600, y: 600, color: "green" },
  // { x: 300, y: 300 },
  // { x: 300, y: 300, color: "blue" },
  // { x: 0, y: 600 },
  // { x: 0, y: 0, color: "cyan" },
  // { x: 300, y: 300 }
];

const multiVertices = [
  [
    [
      { x: 500, y: 100, color: '#ffa500' },
      { x: 500, y: 500, color: '#008000' },
      { x: 100, y: 500, color: '#4b0082' },
      { x: 100, y: 100, color: 'cyan' },
    ],
    [
      { x: 300, y: 300 },
      { x: 300, y: 300 },
      { x: 300, y: 300 },
      { x: 300, y: 300 },
    ],
  ],
  [
    [
      { x: 500, y: 100, color: '#ffff00' },
      { x: 500, y: 500, color: '#0000ff' },
      { x: 100, y: 500, color: '#ee82ee' },
      { x: 100, y: 100, color: '#ff0000' },
    ],
    [
      { x: 300, y: 300 },
      { x: 300, y: 300 },
      { x: 300, y: 300 },
      { x: 300, y: 300 },
    ],
  ],
  [
    [
      { x: 500, y: 100, color: '#ffff00' },
      { x: 500, y: 500, color: '#0000ff' },
      { x: 100, y: 500, color: '#ee82ee' },
      { x: 100, y: 100, color: '#ff0000' },
    ],
    [
      { x: 300, y: 300 },
      { x: 300, y: 300 },
      { x: 300, y: 300 },
      { x: 300, y: 300 },
    ],
  ],
  [
    [
      { x: 500, y: 100, color: '#008000' },
      { x: 500, y: 500, color: '#4b0082' },
      { x: 100, y: 500, color: 'cyan' },
      { x: 100, y: 100, color: '#ffa500' },
    ],
    [
      { x: 300, y: 300 },
      { x: 300, y: 300 },
      { x: 300, y: 300 },
      { x: 300, y: 300 },
    ],
  ],
];

const canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
ctx.fillStyle = '#fff';

ctx.lineCap = 'round';
ctx.lineWidth = 0.5;

// ctx.beginPath();
// ctx.arc(100, 75, 50, 0, 1 * Math.PI);
// ctx.stroke();

// ctx.beginPath();
// ctx.moveTo(20, 20);
// ctx.quadraticCurveTo(20, 100, 200, 20);
// ctx.stroke();

// ctx.beginPath();
// ctx.moveTo(120, 320);
// ctx.bezierCurveTo(120, 400, 300, 400, 300, 320);
// ctx.stroke();

function draw() {
  // Cancel previous animation
  cancelAnimationFrame(rafID);
  // Clear canvas
  ctx.fillRect(0, 0, 1000, 1000);
  // Draw polygon
  // ctx.rotate((45 * Math.PI) / 180);

  drawPolygon(vertices, 10, () => console.log('done'), multiVertices);
}

draw();

// const button = document.querySelector('button');
// button.addEventListener('click', draw);
