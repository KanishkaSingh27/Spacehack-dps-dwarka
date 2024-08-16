document.addEventListener("DOMContentLoaded", function() {
    const foodForm = document.getElementById('food-form');
    const foodList = document.getElementById('food-list');

    // Load food inventory from localStorage or initialize as an empty array
    let foodInventory = JSON.parse(localStorage.getItem('foodInventory')) || [];

    // Event listener for form submission
    foodForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const foodName = document.getElementById('food-name').value;
        const foodQuantity = parseFloat(document.getElementById('food-quantity').value);
        const foodExpiry = document.getElementById('food-expiry').value;

        const foodItem = {
            name: foodName,
            quantity: foodQuantity,
            expiry: foodExpiry
        };

        foodInventory.push(foodItem);
        localStorage.setItem('foodInventory', JSON.stringify(foodInventory));
        updateFoodTable();
        foodForm.reset();
    });

    function updateFoodTable() {
        foodList.innerHTML = ''; // Clear the current list
        
        foodInventory.forEach((food, index) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${food.name}</td>
                <td>${food.quantity.toFixed(2)} kg</td>
                <td>${food.expiry}</td>
                <td>
                    <button class="custom-btn btn-6" onclick="removeFoodQuantity(${index})" >Remove Quantity</button>
                    <button class="custom-btn btn-6" onclick="removeFoodItem(${index})"">Remove Item</button>
                </td>
            `;

            const expiryDate = new Date(food.expiry);
            const today = new Date();
            const timeDiff = expiryDate - today;
            const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));

            if (daysLeft <= 7) { // 1 week
                row.classList.add('warning');
            }

            foodList.appendChild(row);
        });
    }

    window.removeFoodQuantity = function(index) {
        const quantityToRemove = prompt("Enter the quantity (in kg) to remove:");

        if (quantityToRemove !== null && !isNaN(quantityToRemove)) {
            const qtyToRemove = parseFloat(quantityToRemove);

            if (qtyToRemove > 0 && qtyToRemove <= foodInventory[index].quantity) {
                foodInventory[index].quantity -= qtyToRemove;

                // Remove item if quantity is zero or less
                if (foodInventory[index].quantity <= 0) {
                    foodInventory.splice(index, 1);
                }

                localStorage.setItem('foodInventory', JSON.stringify(foodInventory));
                updateFoodTable();
            } else {
                alert("Invalid quantity. Please enter a valid number less than or equal to the available quantity.");
            }
        } else {
            alert("Please enter a valid number.");
        }
    }

    window.removeFoodItem = function(index) {
        if (confirm("Are you sure you want to remove this item?")) {
            foodInventory.splice(index, 1);
            localStorage.setItem('foodInventory', JSON.stringify(foodInventory));
            updateFoodTable();
        }
    }

    updateFoodTable(); // Initial table load
});
