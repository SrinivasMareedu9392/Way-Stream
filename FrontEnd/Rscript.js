// WARNING: Do not expose your real API key in production
const GEMINI_API_KEY = "AIzaSyDvK61xwrcvEpyaKuuWJroyoMqKgXnbHCA"; // Temporary for testing

async function analyzePlaceWithGemini(placeName) {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_API_KEY, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [
                { parts: [{ text: `I'm planning a trip to ${placeName} with my partner. Can you suggest a good itinerary and approximate budget?: ` }] }
            ]
        })
    });

    if (!response.ok) {
        throw new Error("Failed to fetch analysis");
    }

    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
}

// Example usage on button click
document.getElementById("aiAnalyzeBtn").addEventListener("click", async () => {
    const place = document.getElementById("aiPlaceInput").value.trim();

    if (!place) {
        alert("Please enter a place name.");
        return;
    }

    // Open a new dashboard window
    const dashboardWindow = window.open("", "_blank", "width=800,height=600");
    if (!dashboardWindow) {
        alert("Failed to open dashboard. Please allow pop-ups for this site.");
        return;
    }

    // Set initial content for the dashboard
    dashboardWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Analysis Dashboard</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    padding: 0;
                    background-color: #f9f9f9;
                    color: #333;
                }
                h1 {
                    font-size: 1.5rem;
                    color: #0848f8;
                }
                #result {
                    margin-top: 20px;
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    background-color: #fff;
                    font-size: 1rem;
                    line-height: 1.6;
                }
                ul {
                    padding-left: 20px;
                    margin-top: 10px;
                }
                li {
                    margin-bottom: 5px;
                }
                strong {
                    color: #222;
                }
            </style>
        </head>
        <body>
            <h1>Analysis Result for "${place}"</h1>
            <div id="result">Analyzing...</div>
        </body>
        </html>
    `);

    try {
        const analysis = await analyzePlaceWithGemini(place);

        // Format the output (clean markdown and render)
        const cleanedHTML = analysis
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")         // Bold
            .replace(/^\* (.*)$/gm, "<li>$1</li>")                    // Bullet to <li>
            .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")               // Wrap list
            .replace(/\n{2,}/g, "<br><br>")                           // Paragraph spacing
            .replace(/\n/g, "<br>");                                  // Line breaks

        dashboardWindow.document.getElementById("result").innerHTML = cleanedHTML;

    } catch (err) {
        dashboardWindow.document.getElementById("result").textContent = "Error fetching analysis: " + err.message;
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const reviewForm = document.getElementById("reviewForm");
    const reviewsContainer = document.getElementById("reviewsContainer");
    const noReviewsMessage = document.querySelector(".no-reviews");

    // Function to create and display a review
    const displayReview = (name, startLocation, destination, content, rating) => {
        // Hide the "No reviews yet" message
        if (noReviewsMessage) noReviewsMessage.style.display = "none";

        // Create a review card
        const reviewCard = document.createElement("div");
        reviewCard.classList.add("review-card");
        reviewCard.innerHTML = `
            <h4>${name}</h4>
            <p><strong>From:</strong> ${startLocation} <strong>To:</strong> ${destination}</p>
            <p>${content}</p>
            <p><strong>Rating:</strong> ${"★".repeat(rating)}${"☆".repeat(5 - rating)}</p>
            <button class="delete-review-btn">Delete</button> <!-- Added delete button -->
        `;

        // Add delete functionality
        reviewCard.querySelector(".delete-review-btn").addEventListener("click", () => {
            reviewsContainer.removeChild(reviewCard);
            if (reviewsContainer.children.length === 1) {
                noReviewsMessage.style.display = "block"; // Show "No reviews yet" message if no reviews remain
            }
        });

        reviewsContainer.appendChild(reviewCard);
    };

    // Handle form submission
    reviewForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Get form values
        const name = document.getElementById("reviewName").value.trim();
        const startLocation = document.getElementById("reviewStartLocation").value.trim();
        const destination = document.getElementById("reviewDestination").value.trim();
        const content = document.getElementById("reviewContent").value.trim();
        const rating = parseInt(document.getElementById("reviewRating").value);

        // Validate inputs
        if (!name || !startLocation || !destination || !content || isNaN(rating)) {
            alert("Please fill out all fields correctly.");
            return;
        }

        // Display the review
        displayReview(name, startLocation, destination, content, rating);

        // Reset the form
        reviewForm.reset();
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const loginLink = document.getElementById("loginLink");
    const logoutLink = document.getElementById("logoutLink");

    // Removed logout button functionalities
});


document.addEventListener("DOMContentLoaded", () => {
    const loginLink = document.getElementById("loginLink");
    const logoutLink = document.getElementById("logoutLink");

    // Add logout functionality
    if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
            e.preventDefault(); // Prevent default link behavior
            window.location.href = "index.html"; // Redirect to index.html
        });
    }
});
