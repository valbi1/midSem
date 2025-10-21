/*
  B4 Micro-explanation:
  Event delegation is used to manage clicks on the opportunity cards. Instead of adding a listener
  to every "Save" button, a single listener is attached to a parent container (`mainContent`).
  When a click occurs, `event.target.closest('.card-action-btn')` reliably finds the clicked
  button, ensuring the app is memory-efficient and performs well even as cards are added or removed.
*/

// --- Setup and Constants ---
const SID4 = '8480';
const STORAGE_KEY = `opportunityBoard-${SID4}`;

let opportunities = [];
let currentFilter = 'all';

// --- DOM Element References ---
const addButton = document.getElementById('add-opportunity-btn');
const titleInput = document.getElementById('opportunity-title-input');
const typeInput = document.getElementById('opportunity-type-input');
const availableList = document.getElementById('available-list');
const savedList = document.getElementById('saved-list');
const counterSpan = document.getElementById('opportunity-counter');
const mainContent = document.querySelector('.content-area');
const filterContainer = document.querySelector('.filter-controls');
const errorMessageDiv = document.getElementById('error-message');

// --- Main Application Logic ---

function init() {
    loadFromStorage();
    setupEventListeners();
    render();
}

function setupEventListeners() {
    addButton.addEventListener('click', handleAddOpportunity);

    mainContent.addEventListener('click', (event) => {
        const actionButton = event.target.closest('.card-action-btn');
        if (actionButton) {
            const card = actionButton.closest('.opportunity-card');
            const opportunityId = parseInt(card.dataset.id, 10);
            toggleSavedStatus(opportunityId);
        }
    });

    filterContainer.addEventListener('click', (event) => {
        const filterButton = event.target.closest('.filter-btn');
        if (filterButton) {
            currentFilter = filterButton.dataset.filter;
            render();
        }
    });
}

function handleAddOpportunity() {
    const title = titleInput.value.trim();
    const type = typeInput.value; // type (Internship, Scholarship)

    if (!title) {
        showError("Opportunity title cannot be empty.");
        return;
    }
    hideError();

    const newOpportunity = {
        id: Date.now(),
        title: title,
        category: type,
        saved: false,
    };

    opportunities.push(newOpportunity);
    titleInput.value = '';
    saveAndRender();
}

function toggleSavedStatus(id) {
    const opportunity = opportunities.find(op => op.id === id);
    if (opportunity) {
        opportunity.saved = !opportunity.saved;
        saveAndRender();
    }
}

function render() {
    const filteredOpportunities = opportunities.filter(op => {
        if (currentFilter === 'all') return true;
        return op.category === currentFilter;
    });

    availableList.innerHTML = '';
    savedList.innerHTML = '';

    for (const op of filteredOpportunities) {
        const cardElement = createOpportunityCard(op);
        if (op.saved) {
            savedList.appendChild(cardElement);
        } else {
            availableList.appendChild(cardElement);
        }
    }

    updateCounter();
    updateActiveFilter();
}

function createOpportunityCard(opportunity) {
    const card = document.createElement('div');
    card.className = 'opportunity-card';
    card.dataset.id = opportunity.id;

    const buttonText = opportunity.saved ? 'Remove' : 'Save';
    const buttonClass = opportunity.saved ? 'card-action-btn remove-btn' : 'card-action-btn save-btn';

    card.innerHTML = `
        <h3>${escapeHTML(opportunity.title)}</h3>
        <p class="card-details">Category: ${escapeHTML(opportunity.category)}</p>
        <button class="${buttonClass}">${buttonText}</button>
    `;
    return card;
}

function updateCounter() {
    const savedCount = opportunities.filter(op => op.saved).length;
    counterSpan.textContent = `${opportunities.length} opportunities (${savedCount} saved)`;
}

function updateActiveFilter() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === currentFilter);
    });
}

// --- Persistence ---

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(opportunities));
}

function loadFromStorage() {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
        opportunities = JSON.parse(storedData);
    }
}

function saveAndRender() {
    saveToStorage();
    render();
}

// --- Utility Functions ---

function showError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
}

function hideError() {
    errorMessageDiv.style.display = 'none';
}

function escapeHTML(str) {
    const p = document.createElement('p');
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
}

// --- Entry Point ---
document.addEventListener('DOMContentLoaded', init);