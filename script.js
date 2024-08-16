
document.addEventListener("DOMContentLoaded", function() {
    console.log(localStorage.getItem('oxygenData'));

    console.log(localStorage.getItem('waterData'));

    console.log(localStorage.getItem('fuelData'));


    // Base consumption rates (percentage per second)
    const baseOxygenConsumptionRate = 0.5;
    const baseWaterConsumptionRate = 0.3;
    const baseFuelConsumptionRate = 0.2;

    // Elements to update
    const oxygenBar = document.getElementById('oxygen-bar');
    const waterBar = document.getElementById('water-bar');
    const fuelBar = document.getElementById('fuel-bar');
    const oxygenLevelText = document.getElementById('oxygen-level');
    const waterLevelText = document.getElementById('water-level');
    const fuelLevelText = document.getElementById('fuel-level');

    // Buttons
    const oxygenBtn = document.getElementById('oxygen-btn');
    const waterBtn = document.getElementById('water-btn');
    const fuelBtn = document.getElementById('fuel-btn');

    // Data for Chart.js
    let labels = [];
    let oxygenData = [];
    let waterData = [];
    let fuelData = [];
    

    // Check if data exists in local storage

    if (localStorage.getItem('labels')) {

        labels = JSON.parse(localStorage.getItem('labels'));

        oxygenData = JSON.parse(localStorage.getItem('oxygenData'));

        waterData = JSON.parse(localStorage.getItem('waterData'));

        fuelData = JSON.parse(localStorage.getItem('fuelData'));

    }
    console.log(oxygenData)

        // Initial resource levels with random values between 50% and 100%
        oxygenLevel = parseFloat(oxygenData[oxygenData.length - 1]) || Math.random() * 50 + 50;
        waterLevel = parseFloat(waterData[waterData.length - 1]) || Math.random() * 50 + 50;
        fuelLevel = parseFloat(fuelData[fuelData.length - 1]) || Math.random() * 50 + 50;

    // Setup Chart.js

    const ctx = document.getElementById('resourceChart').getContext('2d');

    const resourceChart = new Chart(ctx, {

        type: 'line',

        data: {

            labels: labels,

            datasets: [{

                label: 'Oxygen Level',

                data: oxygenData,

                borderColor: 'rgba(75, 192, 192, 1)',

                borderWidth: 2,

                fill: false

            },

            {

                label: 'Water Level',

                data: waterData,

                borderColor: 'rgba(54, 162, 235, 1)',

                borderWidth: 2,

                fill: false

            },

            {

                label: 'Fuel Level',

                data: fuelData,

                borderColor: 'rgba(255, 99, 132, 1)',

                borderWidth: 2,

                fill: false

            }]

        },

        options: {
            animation: {
                duration:150,
            },

            scales: {

                y: {

                    beginAtZero: true,

                    max: 100

                }

            }

        }

    });

    // Function to get a random fluctuation that can be positive or negative
    function getRandomFluctuation(rate) {
        // Random fluctuation between -0.2 and +0.2
        const fluctuation = (Math.random() - 0.5) * 3;
        return rate + fluctuation;
    }

    // Function to get random resource change
    function getRandomResourceChange() {
        // Randomly decide to either increase or decrease
        return (Math.random() < 0.5 ? 1 : -1) * (Math.random() * 0.5);
    }

    // Function to update resource levels and bars
    function updateResources() {
        // Apply random fluctuations to the consumption rates
        const oxygenConsumptionRate = getRandomFluctuation(baseOxygenConsumptionRate)+0.1;
        const waterConsumptionRate = getRandomFluctuation(baseWaterConsumptionRate)+0.2;
        const fuelConsumptionRate = getRandomFluctuation(baseFuelConsumptionRate)*0.1 +0.5;

        // Random resource change
        const oxygenChange = getRandomResourceChange();
        const waterChange = getRandomResourceChange();
        const fuelChange = getRandomResourceChange();

        // Update levels
        oxygenLevel -= oxygenConsumptionRate;
        waterLevel -= waterConsumptionRate;
        fuelLevel -= fuelConsumptionRate;

        // Apply random changes
        oxygenLevel += oxygenChange;
        waterLevel += waterChange;
        fuelLevel += fuelChange;

        // Ensure levels do not go below 0 or above 100
        if (oxygenLevel < 0) oxygenLevel = 0;
        if (oxygenLevel > 100) oxygenLevel = 100;
        if (waterLevel < 0) waterLevel = 0;
        if (waterLevel > 100) waterLevel = 100;
        if (fuelLevel < 0) fuelLevel = 0;
        if (fuelLevel > 100) fuelLevel = 100;

        // Update the bars
        oxygenBar.style.width = oxygenLevel + "%";
        waterBar.style.width = waterLevel + "%";
        fuelBar.style.width = fuelLevel + "%";

        // Update the text
        oxygenLevelText.textContent = `Level: ${oxygenLevel.toFixed(1)}%`;
        waterLevelText.textContent = `Level: ${waterLevel.toFixed(1)}%`;
        fuelLevelText.textContent = `Level: ${fuelLevel.toFixed(1)}%`;

        // Add data to Chart.js
        labels.push(labels.length);
        oxygenData.push(oxygenLevel.toFixed(1));
        waterData.push(waterLevel.toFixed(1));
        fuelData.push(fuelLevel.toFixed(1));

        if (labels.length > 30) {

            labels.shift(); // remove the oldest entry
          
            oxygenData.shift();
          
            waterData.shift();
          
            fuelData.shift();
          
          }

          // Store only the new entry in local storage
          localStorage.setItem('labels', JSON.stringify(labels.slice(-30))); // store only the last 30 entries

          localStorage.setItem('oxygenData', JSON.stringify(oxygenData.slice(-30)));
          
          localStorage.setItem('waterData', JSON.stringify(waterData.slice(-30)));
          
          localStorage.setItem('fuelData', JSON.stringify(fuelData.slice(-30)));
        
        // Update the chart
        resourceChart.update();

        // Check for critical levels
        checkCriticalLevels();
    }

    // Function to check for critical levels and trigger alerts
    function checkCriticalLevels() {

        if (oxygenLevel < 20) {
      
          showNotification("Warning: Oxygen level critical!", "error");
      
        }
      
        if (waterLevel < 20) {
      
          showNotification("Warning: Water level critical!", "error");
      
        }
      
        if (fuelLevel < 20) {
      
          showNotification("Warning: Fuel level critical!", "error");
      
        }
      
      }
    // Function to add resource levels
    function addResource(resource, amount) {
        resource += amount;
        if (resource > 100) resource = 100;
        return resource;
    }

    // Add a function to show notifications

    function showNotification(message, type) {

        const notificationContainer = document.getElementById("notifications");
    
        let existingNotification = null;
    
    
        // Check if a notification for the same resource is already being shown
    
        for (const notification of notificationContainer.children) {
    
            if (notification.textContent === message) {
    
                existingNotification = notification;
    
                break;
    
            }
    
        }
    
    
        if (existingNotification) {
    
            // Update the existing notification
    
            existingNotification.className = `notification ${type}`;
    
            existingNotification.textContent = message;
    
        } else {
    
            // Create a new notification
    
            const notification = document.createElement("div");
    
            notification.className = `notification ${type}`;
    
            notification.textContent = message;
    
            notificationContainer.appendChild(notification);
    
        }
    
    
        notificationContainer.style.display = "block";
    
        setTimeout(() => {
    
            if (existingNotification) {
    
                existingNotification.remove();
    
            } else {
    
                notification.remove();
    
            }
    
            if (notificationContainer.childElementCount === 0) {
    
                notificationContainer.style.display = "none";
    
            }
    
        }, 3000);
    
        console.log(`Showing notification: ${message}`);
    
    }

    // Event listeners for the buttons
    oxygenBtn.addEventListener('click', function() {
        oxygenLevel = addResource(oxygenLevel, 10);
        updateResources();
    });

    waterBtn.addEventListener('click', function() {
        waterLevel = addResource(waterLevel, 10);
        updateResources();
    });

    fuelBtn.addEventListener('click', function() {
        fuelLevel = addResource(fuelLevel, 10);
        updateResources();
    });

    // Update resources every second
    setInterval(updateResources, 1000);
});
