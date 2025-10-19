// Stock data
let stock = {
    'Blanca': { S: 5, M: 30, L: 41, XL: 21, XXL: 3 },
    'Negra': { S: 5, M: 30, L: 41, XL: 21, XXL: 3 }
};

// Google Apps Script URL para obtener stock
const STOCK_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx4fbmrL9nbqJB6uZZHfQEKbb1CDMkSni92noF12c2RcTpW9yThKobb7owXp4GZsV74/exec';

// Initialize stock display
function initializeStock() {
    console.log('=== Initializing Stock ===');
    syncStockFromServer();
}

// Sync stock from Google Sheet
function syncStockFromServer() {
    console.log('=== Syncing Stock from Server ===');
    fetch(STOCK_SCRIPT_URL)
        .then(response => {
            console.log('Response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Stock API Response:', data);
            if (data.success && data.stock) {
                console.log('Stock received from server:', data.stock);
                stock = data.stock;
                console.log('Stock object updated:', stock);
                updateStockDisplay();
                updateFormValidation();
                console.log('Stock sincronizado:', stock);
            } else {
                console.warn('API returned success=false or no stock data');
            }
        })
        .catch(error => {
            console.error('Error syncing stock:', error);
            console.log('Usando stock local...');
            updateStockDisplay();
            updateFormValidation();
        });
}

// Update stock display
function updateStockDisplay() {
    const whiteStockElements = document.querySelectorAll('#white-stock, #white-stock-detail');
    let whiteStockText = 'Disponible: ';
    for (const size in stock['Blanca']) {
        whiteStockText += `${size}: ${stock['Blanca'][size]} | `;
    }
    whiteStockElements.forEach(el => {
        if (el) el.textContent = whiteStockText.slice(0, -3);
    });

    const blackStockElements = document.querySelectorAll('#black-stock, #black-stock-detail');
    let blackStockText = 'Disponible: ';
    for (const size in stock['Negra']) {
        blackStockText += `${size}: ${stock['Negra'][size]} | `;
    }
    blackStockElements.forEach(el => {
        if (el) el.textContent = blackStockText.slice(0, -3);
    });
}

// Update form validation - desabilitar tallas sin stock
function updateFormValidation() {
    updateSelectOptions('size-white', stock['Blanca']);
    updateSelectOptions('size-black', stock['Negra']);
}

// Actualizar opciones de un select
function updateSelectOptions(selectId, stockData) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const options = select.querySelectorAll('option');
    options.forEach(option => {
        if (option.value === '') return; // Skip placeholder
        
        const quantity = stockData[option.value];
        if (quantity > 0) {
            option.textContent = option.value;
            option.disabled = false;
        } else {
            option.textContent = `${option.value} (Agotado)`;
            option.disabled = true;
        }
    });
}

// Handle payment method visibility (no necesario con iframe embebido)
function setupPaymentHandler() {
    // Google Forms maneja esto automáticamente
}

// Handle form submission
function setupFormSubmission() {
    // Con el iframe embebido de Google Forms, no necesitamos manejar el envío
    // Google Forms lo maneja automáticamente
}

// Carousel functionality
function initializeCarousel(carouselId, dotsContainerId, zoomBtnId, zoomModalId, zoomImageId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dotsContainer = document.getElementById(dotsContainerId);
    const zoomBtn = document.getElementById(zoomBtnId);
    const zoomModal = document.getElementById(zoomModalId);
    const zoomImage = document.getElementById(zoomImageId);
    const zoomClose = zoomModal.querySelector('.zoom-close');
    
    let currentSlide = 0;
    let slideInterval;
    
    // Clear existing dots
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
    }
    
    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active');
        dot.type = 'button';
        dot.addEventListener('click', () => {
            goToSlide(index);
        });
        if (dotsContainer) {
            dotsContainer.appendChild(dot);
        }
    });
    
    function goToSlide(slideIndex) {
        currentSlide = slideIndex;
        carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        if (dotsContainer) {
            dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }
    }
    
    slideInterval = setInterval(() => {
        nextSlide();
    }, 5000);
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        goToSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        goToSlide(currentSlide);
    }
    
    // Zoom functionality
    if (zoomBtn) {
        zoomBtn.addEventListener('click', () => {
            const currentImg = slides[currentSlide].querySelector('img');
            if (currentImg) {
                zoomImage.src = currentImg.src;
                zoomModal.style.display = 'flex';
            }
        });
    }
    
    if (zoomClose) {
        zoomClose.addEventListener('click', () => {
            zoomModal.style.display = 'none';
        });
    }
    
    zoomModal.addEventListener('click', (e) => {
        if (e.target === zoomModal) {
            zoomModal.style.display = 'none';
        }
    });
    
    const productType = carouselId.split('-')[1];
    
    // Add event listeners for carousel buttons
    document.querySelectorAll(`[data-carousel="${productType}"]`).forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('carousel-next')) {
                nextSlide();
            } else {
                prevSlide();
            }
            
            clearInterval(slideInterval);
            slideInterval = setInterval(() => {
                nextSlide();
            }, 5000);
        });
    });
    
    // Pause auto-advance on hover
    const carouselContainer = carousel.parentElement;
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        carouselContainer.addEventListener('mouseleave', () => {
            clearInterval(slideInterval);
            slideInterval = setInterval(() => {
                nextSlide();
            }, 5000);
        });
    }
}

// Show product page
function showProductPage(productId) {
    const sectionId = productId;
    
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        if (sectionId === 'camiseta-blanca') {
            initializeCarousel('carousel-white', 'carousel-dots-white', 'zoom-btn-white', 'zoom-modal-white', 'zoom-image-white');
        } else if (sectionId === 'camiseta-negra') {
            initializeCarousel('carousel-black', 'carousel-dots-black', 'zoom-btn-black', 'zoom-modal-black', 'zoom-image-black');
        }
        
        setTimeout(() => {
            setupPaymentHandler();
        }, 100);
    }
    
    window.scrollTo(0, 0);
}

function showSection(sectionId) {
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        if (sectionId === 'camiseta-blanca') {
            initializeCarousel('carousel-white', 'carousel-dots-white', 'zoom-btn-white', 'zoom-modal-white', 'zoom-image-white');
        } else if (sectionId === 'camiseta-negra') {
            initializeCarousel('carousel-black', 'carousel-dots-black', 'zoom-btn-black', 'zoom-modal-black', 'zoom-image-black');
        }
        
        setTimeout(() => {
            setupPaymentHandler();
        }, 100);
    }
    
    window.scrollTo(0, 0);
}

function showSectionBasedOnHash() {
    const hash = window.location.hash.substring(1);
    const sectionId = hash || 'inicio';
    showSection(sectionId);
}

// Setup navigation
function setupNavigation() {
    window.addEventListener('hashchange', showSectionBasedOnHash);
    
    document.querySelectorAll('.back-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.hash = 'tienda';
        });
    });
    
    document.querySelectorAll('nav a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            window.location.hash = targetId;
        });
    });
}

// Sincronizar stock cada 30 segundos
function setupStockSync() {
    setInterval(() => {
        syncStockFromServer();
    }, 30000);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeStock();
    setupFormSubmission();
    setupPaymentHandler();
    setupNavigation();
    setupStockSync();
    
    showSectionBasedOnHash();
});
