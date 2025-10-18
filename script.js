// Stock data from the provided table
let stock = {
    white: {
        S: 5,
        M: 30,
        L: 41,
        XL: 21,
        XXL: 3
    },
    black: {
        S: 5,
        M: 30,
        L: 41,
        XL: 21,
        XXL: 3
    }
};

// Global variables to track selections
let selectedSize = {
    white: null,
    black: null
};

let selectedPayment = {
    white: null,
    black: null
};

// Google Apps Script URL - ACTUALIZA ESTO CON TU URL REAL
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzEWMDVelvduAqeTl5HNzqscDttSN2GZUVb8qQebep15TSamP5AXYIxSySjqwoRD1N0/usercontent';
const STOCK_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzEWMDVelvduAqeTl5HNzqscDttSN2GZUVb8qQebep15TSamP5AXYIxSySjqwoRD1N0/usercontent?action=getStock';

// Proxy CORS (alternativa si CORS falla)
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

// Initialize stock display and sync with server
function initializeStock() {
    syncStockFromServer();
}

// Sync stock from Google Sheet
function syncStockFromServer() {
    fetch(STOCK_SCRIPT_URL, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.stock) {
                stock = data.stock;
                updateStockDisplay();
                markSoldOutSizes('white');
                markSoldOutSizes('black');
                console.log('Stock sincronizado desde servidor:', stock);
            }
        })
        .catch(error => {
            console.log('No se pudo sincronizar stock desde servidor:', error);
            console.log('Usando stock local...');
            updateStockDisplay();
            markSoldOutSizes('white');
            markSoldOutSizes('black');
        });
}

function updateStockDisplay() {
    // Update white shirt stock info
    const whiteStockElements = document.querySelectorAll('#white-stock, #white-stock-detail');
    let whiteStockText = 'Disponible: ';
    for (const size in stock.white) {
        whiteStockText += `${size}: ${stock.white[size]} | `;
    }
    whiteStockElements.forEach(el => {
        if (el) el.textContent = whiteStockText.slice(0, -3);
    });

    // Update black shirt stock info
    const blackStockElements = document.querySelectorAll('#black-stock, #black-stock-detail');
    let blackStockText = 'Disponible: ';
    for (const size in stock.black) {
        blackStockText += `${size}: ${stock.black[size]} | `;
    }
    blackStockElements.forEach(el => {
        if (el) el.textContent = blackStockText.slice(0, -3);
    });
}

// Mark sold out sizes
function markSoldOutSizes(product) {
    const sizes = document.querySelectorAll(`.size[data-product="${product}"]`);
    sizes.forEach(sizeElement => {
        const size = sizeElement.getAttribute('data-size');
        const quantity = stock[product][size];
        
        sizeElement.classList.remove('sold-out');
        sizeElement.style.opacity = '1';
        
        if (quantity <= 0) {
            sizeElement.classList.add('sold-out');
            sizeElement.textContent = `${size} (Agotado)`;
            sizeElement.style.cursor = 'not-allowed';
            sizeElement.style.opacity = '0.6';
        } else {
            sizeElement.textContent = size;
            sizeElement.style.cursor = 'pointer';
        }
    });
}

// Handle size selection
function setupSizeSelection() {
    document.querySelectorAll('.size').forEach(sizeElement => {
        sizeElement.addEventListener('click', function() {
            if (this.classList.contains('sold-out')) return;
            
            const product = this.getAttribute('data-product');
            const size = this.getAttribute('data-size');
            
            document.querySelectorAll(`.size[data-product="${product}"]`).forEach(el => {
                el.classList.remove('selected');
            });
            
            this.classList.add('selected');
            selectedSize[product] = size;
            updateSelectedProductDisplay(product, size);
        });
    });
}

function updateSelectedProductDisplay(product, size) {
    const productName = product === 'white' ? 'Camiseta Blanca' : 'Camiseta Negra';
    const selectedProductElements = document.querySelectorAll(`#selected-product-${product}`);
    
    selectedProductElements.forEach(element => {
        if (element) {
            element.textContent = `${productName} - Talla ${size}`;
            element.style.fontWeight = 'bold';
            element.style.color = '#800020';
        }
    });
}

// Handle payment method selection
function setupPaymentSelection() {
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', function() {
            const form = this.closest('form');
            const product = form.id.includes('white') ? 'white' : 'black';
            
            form.querySelectorAll('.payment-option').forEach(el => {
                el.classList.remove('selected');
            });
            
            this.classList.add('selected');
            selectedPayment[product] = this.getAttribute('data-payment');
            
            const ibanInfo = form.querySelector('.iban-info');
            if (selectedPayment[product] === 'transfer') {
                ibanInfo.classList.add('show');
            } else {
                ibanInfo.classList.remove('show');
            }
        });
    });
}

// Handle form submission
function setupFormSubmission() {
    document.getElementById('reservation-form-white')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleReservationFormSubmit(this, 'white');
    });

    document.getElementById('reservation-form-black')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleReservationFormSubmit(this, 'black');
    });
}

// Generic function to handle form submission
function handleReservationFormSubmit(form, product) {
    if (!selectedSize[product]) {
        alert('Por favor, selecciona una talla de camiseta');
        return;
    }
    
    const size = selectedSize[product];
    
    if (stock[product][size] <= 0) {
        alert('Lo sentimos, esta talla ya no está disponible');
        return;
    }
    
    if (!selectedPayment[product]) {
        alert('Por favor, selecciona un método de pago');
        return;
    }
    
    const formData = {
        name: form.querySelector('input[type="text"]').value,
        email: form.querySelector('input[type="email"]').value,
        phone: form.querySelector('input[type="tel"]').value,
        product: product === 'white' ? 'Camiseta Blanca' : 'Camiseta Negra',
        size: size,
        payment: selectedPayment[product] === 'transfer' ? 'Transferencia' : 'En mano',
        notes: form.querySelector('textarea') ? form.querySelector('textarea').value : '',
        timestamp: new Date().toISOString()
    };
    
    if (!formData.name || !formData.email || !formData.phone) {
        alert('Por favor, completa todos los campos obligatorios');
        return;
    }
    
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Procesando reserva...';
    submitButton.disabled = true;
    
    fetch(SCRIPT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error('Error de red: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.success) {
            alert('¡Reserva realizada con éxito! Te hemos enviado un email de confirmación. ID de reserva: ' + data.reservationId);
            
            // Actualizar stock localmente
            stock[product][size]--;
            updateStockDisplay();
            markSoldOutSizes(product);
            
            form.reset();
            resetSelections(product);
            
            setTimeout(() => {
                window.location.hash = '#tienda';
                showSectionBasedOnHash();
            }, 2000);
        } else {
            alert('Error al procesar la reserva: ' + (data.error || 'Error desconocido'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un error al procesar la reserva. Por favor, inténtalo de nuevo o contacta con nosotros directamente en durogalvanband@gmail.com.');
    })
    .finally(() => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    });
}

function resetSelections(product) {
    selectedSize[product] = null;
    selectedPayment[product] = null;
    
    document.querySelectorAll(`.size[data-product="${product}"]`).forEach(el => {
        el.classList.remove('selected');
    });
    
    document.querySelectorAll(`#reservation-form-${product} .payment-option`).forEach(el => {
        el.classList.remove('selected');
    });
    
    document.querySelectorAll(`#reservation-form-${product} .iban-info`).forEach(el => {
        el.classList.remove('show');
    });
    
    const selectedProductElements = document.querySelectorAll(`#selected-product-${product}`);
    selectedProductElements.forEach(element => {
        if (element) {
            const productName = product === 'white' ? 'Camiseta Blanca' : 'Camiseta Negra';
            element.textContent = `${productName} - Por favor, selecciona una talla`;
            element.style.fontWeight = 'normal';
            element.style.color = 'inherit';
        }
    });
}

// Carousel functionality with zoom
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
    
    // Adaptar altura del carrusel a las imágenes
    function adaptCarouselHeight() {
        const currentImg = slides[currentSlide].querySelector('img');
        if (currentImg) {
            currentImg.onload = () => {
                carousel.parentElement.style.maxWidth = '100%';
            };
            currentImg.onerror = () => {
                carousel.parentElement.style.maxHeight = '500px';
            };
        }
    }
    
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
        
        adaptCarouselHeight();
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
    
    adaptCarouselHeight();
}

// Function to show a specific section
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
            setupSizeSelection();
            setupPaymentSelection();
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
            setupSizeSelection();
            setupPaymentSelection();
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
    setupSizeSelection();
    setupPaymentSelection();
    setupFormSubmission();
    setupNavigation();
    setupStockSync();
    
    showSectionBasedOnHash();
});
