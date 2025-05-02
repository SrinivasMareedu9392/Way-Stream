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
                { parts: [{ text: `Describe the route of ${placeName}. Road Conditions and Travel Experience , Accommodation (Hotels/Lodging) , Restaurants , Tourist Attractions andemo mari Budget and Costs` }] }
            ]
        })
    });

    if (!response.ok) {
        throw new Error("Failed to fetch analysis for " + placeName);
    }

    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
}

async function handleAnalyzePlace(start, destination) {
    // Validate inputs
    if (!start || !destination) {
        throw new Error('Both start and destination locations are required.');
    }

    // Sanitize inputs to prevent XSS
    const sanitize = (str) => {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    };
    const safeStart = sanitize(start);
    const safeDestination = sanitize(destination);

    // Show loading modal
    const modal = createLoadingModal();
    document.body.appendChild(modal);

    try {
        // Analyze both locations
        const [startAnalysis, destinationAnalysis] = await Promise.all([
            analyzePlaceWithGemini(safeStart),
            analyzePlaceWithGemini(safeDestination)
        ]);

        // Format analysis
        const formattedAnalysis = formatAnalysis(safeStart, safeDestination, startAnalysis, destinationAnalysis);

        // Remove loading modal and display results
        modal.remove();
        displayDashboard(formattedAnalysis);
    } catch (error) {
        modal.remove();
        throw error;
    }
}

function formatAnalysis(start, destination, startAnalysis, destinationAnalysis) {
    // Clean and format Markdown to HTML
    const cleanMarkdown = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/^\* (.*)$/gm, "<li>$1</li>")
            .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
            .replace(/\n{2,}/g, "<br><br>")
            .replace(/\n/g, "<br>");
    };

    const startHtml = cleanMarkdown(startAnalysis);
    const destinationHtml = cleanMarkdown(destinationAnalysis);

    return {
        start,
        destination,
        overview: `Explore your journey from ${start} to ${destination} with tailored itineraries and budget estimates for each location.`,
        content: `
            <h4>${start}</h4>
            <div class="analysis-content">${startHtml}</div>
            <h4>${destination}</h4>
            <div class="analysis-content">${destinationHtml}</div>
        `
    };
}

function createLoadingModal() {
    const modal = document.createElement('div');
    modal.className = 'analysis-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="loading">Analyzing... <i class="fas fa-spinner fa-spin"></i></div>
        </div>
    `;
    return modal;
}

function displayDashboard(data) {
    // Remove existing modal if any
    const existingModal = document.querySelector('.analysis-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'analysis-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="close-btn">×</button>
            <h3>Travel Analysis</h3>
            <h4>From ${data.start} to ${data.destination}</h4>
            <div class="overview">${data.overview}</div>
            <div class="analysis-content">${data.content}</div>
        </div>
    `;

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
        .analysis-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease;
        }
        .modal-content {
            background: var(--light, #ffffff);
            padding: 2rem;
            border-radius: 12px;
            max-width: 700px;
            width: 90%;
            box-shadow: var(--shadow, 0 4px 12px rgba(0, 0, 0, 0.1));
            position: relative;
            max-height: 80vh;
            overflow-y: auto;
        }
        .modal-content h3 {
            font-family: 'Inter', sans-serif;
            font-size: 1.5rem;
            color: var(--primary-dark, #152e6e);
            margin-bottom: 1rem;
            text-align: center;
        }
        .modal-content h4 {
            font-family: 'Inter', sans-serif;
            font-size: 1.2rem;
            color: var(--dark, #1a1a1a);
            margin: 1.5rem 0 1rem;
        }
        .modal-content .overview {
            font-size: 1rem;
            color: var(--dark-gray, #6b7280);
            margin-bottom: 1.5rem;
            line-height: 1.6;
        }
        .modal-content .analysis-content {
            font-size: 0.95rem;
            color: var(--dark, #1a1a1a);
            line-height: 1.6;
        }
        .modal-content .analysis-content ul {
            padding-left: 20px;
            margin: 0.5rem 0;
        }
        .modal-content .analysis-content li {
            margin-bottom: 0.5rem;
        }
        .modal-content .loading {
            text-align: center;
            font-size: 1rem;
            color: var(--dark-gray, #6b7280);
            padding: 2rem;
        }
        .modal-content .loading i {
            margin-left: 0.5rem;
        }
        .close-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 1.5rem;
            color: var(--dark-gray, #6b7280);
            cursor: pointer;
            transition: var(--transition, all 0.3s ease);
        }
        .close-btn:hover {
            color: var(--primary, #1a3c87);
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @media (max-width: 768px) {
            .modal-content {
                padding: 1.5rem;
                width: 95%;
            }
            .modal-content h3 {
                font-size: 1.3rem;
            }
            .modal-content h4 {
                font-size: 1.1rem;
            }
        }
    `;
    document.head.appendChild(style);

    // Append modal to body
    document.body.appendChild(modal);

    // Add close button functionality
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });

    // Close modal on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}
