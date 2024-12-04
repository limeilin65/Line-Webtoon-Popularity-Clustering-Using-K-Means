// data array buat masukin manual maupun excel
let data = [];

// fungsi yang menampilkan data dalam tabel
function displayData(sampleOnly = true) {
  const tableBody = document.querySelector("#dataTable tbody");
  tableBody.innerHTML = ""; // Clear the table before populating new data

  const rowsToDisplay = sampleOnly ? data.slice(0, 10) : data;

  rowsToDisplay.forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((val) => {
      const td = document.createElement("td");
      td.textContent = val;
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

// buat nampilin sebagian apa keseuruhan sample data
document.getElementById("displayMode").addEventListener("change", () => {
  const displayMode = document.getElementById("displayMode").value;
  displayData(displayMode === "sample");
});

// kalo masukin data manual ntar diambil disini
document.getElementById("addData").addEventListener("click", () => {
  const views = parseInt(document.getElementById("views").value);
  const likes = parseInt(document.getElementById("likes").value);
  const ratings = parseFloat(document.getElementById("ratings").value);
  const subscribers = parseInt(document.getElementById("subscribers").value);

  if (isNaN(views) || isNaN(likes) || isNaN(ratings) || isNaN(subscribers)) {
    alert("Please fill all fields with valid numbers.");
    return;
  }

  data.push([views, likes, ratings, subscribers]);
  alert("Data added successfully!");
  displayData();
});

// Import data dari Excel
document.getElementById("importExcel").addEventListener("click", () => {
  const fileInput = document.getElementById("excelFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select an Excel file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataArray = new Uint8Array(e.target.result);
    const workbook = XLSX.read(dataArray, { type: "array" });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    jsonData.slice(1).forEach((row) => {
      if (row.length >= 4) {
        const views = parseInt(row[0]);
        const likes = parseInt(row[1]);
        const ratings = parseFloat(row[2]);
        const subscribers = parseInt(row[3]);

        if (
          !isNaN(views) &&
          !isNaN(likes) &&
          !isNaN(ratings) &&
          !isNaN(subscribers)
        ) {
          data.push([views, likes, ratings, subscribers]);
        }
      }
    });

    alert("Import data excel berhasil😁!");
    displayData();
  };

  reader.readAsArrayBuffer(file);
});
// Start Process for K-Means Implementation
// Preprocess the data (normalization)
function normalizeData(dataset) {
  const normalizedData = [];
  const minValues = [];
  const maxValues = [];

  // Initialize min and max values
  for (let i = 0; i < dataset[0].length; i++) {
    minValues[i] = Math.min(...dataset.map((row) => row[i]));
    maxValues[i] = Math.max(...dataset.map((row) => row[i]));
  }

  // Normalize the data (min-max normalization)
  dataset.forEach((row) => {
    const normalizedRow = row.map(
      (value, i) => (value - minValues[i]) / (maxValues[i] - minValues[i])
    );
    normalizedData.push(normalizedRow);
  });

  return normalizedData;
}

// Determine optimal number of clusters using Elbow Method
document.getElementById("elbowMethod").addEventListener("click", () => {
  const normalizedData = normalizeData(data);
  const maxClusters = 10;
  const wcss = [];

  for (let k = 1; k <= maxClusters; k++) {
    const result = kMeans(normalizedData, k);
    const currentWCSS = calculateWCSS(
      normalizedData,
      result.centroids,
      result.assignments
    );
    wcss.push(currentWCSS);
  }

  console.log("WCSS values: ", wcss);
  alert(
    `nilai WCSS untuk setiap K <urutin Yak dari k=1 😊>: ${wcss.join(", ")}`
  );
});

// K-Means implementation
function kMeans(dataset, K) {
  let centroids = [];
  for (let i = 0; i < K; i++) {
    const randIndex = Math.floor(Math.random() * dataset.length);
    centroids.push(dataset[randIndex]);
  }

  let assignments = new Array(dataset.length).fill(-1);
  let iteration = 0;
  let converged = false;

  while (!converged && iteration < 100) {
    iteration++;

    const newAssignments = dataset.map((point) => {
      let minDistance = Infinity;
      let assignedCluster = -1;

      centroids.forEach((centroid, idx) => {
        const distance = euclideanDistance(point, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          assignedCluster = idx;
        }
      });

      return assignedCluster;
    });

    converged = newAssignments.every(
      (value, index) => value === assignments[index]
    );
    assignments = newAssignments;

    centroids = centroids.map((_, clusterIndex) => {
      const clusterPoints = dataset.filter(
        (_, pointIndex) => assignments[pointIndex] === clusterIndex
      );
      if (clusterPoints.length > 0) {
        return averagePoints(clusterPoints);
      }
      return centroids[clusterIndex];
    });
  }

  return { centroids, assignments };
}

// Euclidean distance function
function euclideanDistance(pointA, pointB) {
  return Math.sqrt(
    pointA.reduce(
      (sum, val, index) => sum + Math.pow(val - pointB[index], 2),
      0
    )
  );
}

// Calculate centroid based on average points
function averagePoints(points) {
  const numPoints = points.length;
  const numDimensions = points[0].length;
  const sums = new Array(numDimensions).fill(0);

  points.forEach((point) => {
    point.forEach((value, index) => {
      sums[index] += value;
    });
  });

  return sums.map((sum) => sum / numPoints);
}

// Calculate WCSS (Within-Cluster-Sum-of-Squares)
function calculateWCSS(dataset, centroids, assignments) {
  let totalWCSS = 0;

  dataset.forEach((point, index) => {
    const centroid = centroids[assignments[index]];
    const distance = euclideanDistance(point, centroid);
    totalWCSS += Math.pow(distance, 2);
  });

  return totalWCSS;
}

// Disini buat nampilin Scatter Plotnya
function createScatterPlot(dataset, assignments) {
  const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]; // Colors for clusters
  const scatterData = assignments.map((assignment, index) => ({
    x: dataset[index][0], // Assuming x-axis is "Views"
    y: dataset[index][1], // Assuming y-axis is "Likes"
    r: dataset[index][2] * 10, // Use "Ratings" to control bubble size
    backgroundColor: colors[assignment % colors.length], // Different color per cluster
  }));

  const ctx = document.getElementById("scatterPlot").getContext("2d");
  new Chart(ctx, {
    type: "bubble",
    data: {
      datasets: [
        {
          label: "Clustered Data",
          data: scatterData,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: "Views",
          },
        },
        y: {
          title: {
            display: true,
            text: "Likes",
          },
        },
      },
    },
  });
}
// Function to display clustering result in table
function displayClusterResult(dataset, assignments) {
  const tableBody = document.querySelector("#clusterResultTable tbody");
  tableBody.innerHTML = ""; // Clear the table before populating new data

  dataset.forEach((row, index) => {
    const tr = document.createElement("tr");

    // Add data columns (Views, Likes, Ratings, Subscribers)
    row.forEach((val) => {
      const td = document.createElement("td");
      td.textContent = val.toFixed(2); // Format data to 2 decimal places
      tr.appendChild(td);
    });

    // Add Cluster column
    const clusterTd = document.createElement("td");
    clusterTd.textContent = assignments[index] + 1; // Cluster number (add 1 to avoid zero-based index)
    tr.appendChild(clusterTd);

    tableBody.appendChild(tr);
  });
}

// Function to calculate the average for each cluster
function calculateClusterAverages(dataset, assignments, K) {
  const clusterSums = Array.from({ length: K }, () =>
    Array(dataset[0].length).fill(0)
  );
  const clusterCounts = Array(K).fill(0);

  // Calculate the sum of each feature for each cluster
  dataset.forEach((dataPoint, index) => {
    const cluster = assignments[index];
    clusterCounts[cluster] += 1;
    dataPoint.forEach((value, featureIndex) => {
      clusterSums[cluster][featureIndex] += value;
    });
  });

  // Calculate the averages
  const clusterAverages = clusterSums.map((sums, cluster) => {
    return sums.map((sum) => sum / clusterCounts[cluster]);
  });

  return clusterAverages;
}

// Display cluster popularities based on average values
function displayClusterPopularities(clusterAverages) {
  clusterAverages.forEach((averages, clusterIndex) => {
    console.log(`Cluster ${clusterIndex + 1} Averages:`);
    console.log(`  Views: ${averages[0].toFixed(2)}`);
    console.log(`  Likes: ${averages[1].toFixed(2)}`);
    console.log(`  Ratings: ${averages[2].toFixed(2)}`);
    console.log(`  Subscribers: ${averages[3].toFixed(2)}`);

    // Define popularity based on average values (example threshold)
    const popularityScore =
      (averages[0] + averages[1] + averages[2] + averages[3]) / 4;
    if (popularityScore > 80) {
      console.log(`Cluster ${clusterIndex + 1}: Sangat Populer`);
    } else if (popularityScore > 70) {
      console.log(`Cluster ${clusterIndex + 1}: Cukup Populer`);
    } else if (popularityScore > 60) {
      console.log(`Cluster ${clusterIndex + 1}: Kurang Populer`);
    } else {
      console.log(`Cluster ${clusterIndex + 1}: Tidak Populer`);
    }
  });
}

// Event listener for clustering button
document.getElementById("clusterData").addEventListener("click", () => {
  const K = 4; // Number of clusters (you can modify it)
  if (data.length < K) {
    alert("Not enough data points to cluster. Add more data.");
    return;
  }

  const normalizedData = normalizeData(data); // Normalize the data
  const result = kMeans(normalizedData, K); // Perform K-Means clustering

  displayClusterResult(data, result.assignments); // Display clustering result in a table
  createScatterPlot(normalizedData, result.assignments); // Display scatter plot

  // Calculate cluster averages and display popularities
  const clusterAverages = calculateClusterAverages(data, result.assignments, K);
  displayClusterPopularities(clusterAverages); // Display the popularity of each cluster
});
