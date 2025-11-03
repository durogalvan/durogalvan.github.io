// Stock data
let stock = {
    'Blanca': { S: 5, M: 30, L: 41, XL: 21, XXL: 3 },
    'Negra': { S: 5, M: 30, L: 41, XL: 21, XXL: 3 }
};

// Google Apps Script URL para obtener stock
const STOCK_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx4fbmrL9nbqJB6uZZHfQEKbb1CDMkSni92noF12c2RcTpW9yThKobb7owXp4GZsV74/exec?action=getStock';

// Initialize stock display
function initializeStock() {
    console.log('=== Initializing Stock ===');
    syncStockFromServer();
}

// Sync stock from Google Sheet
function syncStockFromServer() {
    console.log('=== Syncing Stock from Server ===');
    console.log('Fetching from:', STOCK_SCRIPT_URL);
    
    fetch(STOCK_SCRIPT_URL)
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response type:', response.type);
            return response.json();
        })
        .then(data => {
            console.log('Full API Response:', JSON.stringify(data));
            console.log('Data keys:', Object.keys(data));
            console.log('data.success:', data.success);
            console.log('data.stock:', data.stock);
            
            if (data.success && data.stock) {
                console.log('✓ Stock received successfully');
                stock = data.stock;
                console.log('Stock object updated to:', stock);
                updateStockDisplay();
                updateFormValidation();
                console.log('Display and validation updated');
            } else {
                console.warn('✗ API response not successful');
                console.warn('Success:', data.success, 'Stock:', data.stock);
                console.warn('Error:', data.error);
            }
        })
        .catch(error => {
            console.error('✗ Fetch error:', error);
            console.log('Using stock local...');
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
    updateAvailabilityWarnings();
}

// Mostrar avisos de disponibilidad
function updateAvailabilityWarnings() {
    updateAvailabilityWarning('white', stock['Blanca']);
    updateAvailabilityWarning('black', stock['Negra']);
}

function updateAvailabilityWarning(product, stockData) {
    const warningElement = document.getElementById(`${product}-availability-warning`);
    if (!warningElement) return;
    
    const soldOutSizes = [];
    const availableSizes = [];
    
    for (const size in stockData) {
        if (stockData[size] <= 0) {
            soldOutSizes.push(size);
        } else {
            availableSizes.push(`${size} (${stockData[size]} ud.)`);
        }
    }
    
    warningElement.innerHTML = '';
    
    if (soldOutSizes.length > 0) {
        const allSoldOut = soldOutSizes.length === Object.keys(stockData).length;
        
        if (allSoldOut) {
            warningElement.innerHTML = `
                <strong>⚠️ Camiseta agotada</strong><br>
                Lo sentimos, todas las tallas están agotadas.
            `;
            warningElement.classList.add('show', 'all-sold-out');
        } else {
            warningElement.innerHTML = `
                <strong>⚠️ Tallas agotadas:</strong> ${soldOutSizes.join(', ')}<br>
                <strong>✓ Disponibles:</strong> ${availableSizes.join(', ')}
            `;
            warningElement.classList.add('show');
            warningElement.classList.remove('all-sold-out');
        }
    } else {
        warningElement.classList.remove('show', 'all-sold-out');
    }
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

// Detectar si es dispositivo móvil
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

// Carousel functionality con zoom mejorado
function initializeCarousel(carouselId, dotsContainerId, zoomBtnId, zoomModalId, zoomImageId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dotsContainer = document.getElementById(dotsContainerId);
    const zoomBtn = document.getElementById(zoomBtnId);
    const zoomModal = document.getElementById(zoomModalId);
    const zoomImage = document.getElementById(zoomImageId);
    const zoomClose = zoomModal ? zoomModal.querySelector('.zoom-close') : null;
    
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
    
    // NUEVO SISTEMA DE ZOOM
    const mobile = isMobile();
    
    if (!mobile) {
        // DESKTOP: Zoom con hover del cursor
        slides.forEach(slide => {
            const img = slide.querySelector('img');
            if (!img) return;
            
            // Crear contenedor de zoom
            const zoomOverlay = document.createElement('div');
            zoomOverlay.className = 'zoom-overlay';
            zoomOverlay.style.backgroundImage = `url(${img.src})`;
            slide.appendChild(zoomOverlay);
            
            slide.addEventListener('mouseenter', () => {
                zoomOverlay.style.display = 'block';
            });
            
            slide.addEventListener('mouseleave', () => {
                zoomOverlay.style.display = 'none';
            });
            
            slide.addEventListener('mousemove', (e) => {
                const rect = slide.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                
                zoomOverlay.style.backgroundPosition = `${x}% ${y}%`;
            });
            
            // Click para zoom modal completo
            slide.addEventListener('click', () => {
                if (zoomModal && zoomImage) {
                    zoomImage.src = img.src;
                    zoomModal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                }
            });
        });
    } else {
        // MÓVIL: Click para abrir modal con pinch zoom nativo
        slides.forEach(slide => {
            const img = slide.querySelector('img');
            if (!img) return;
            
            slide.addEventListener('click', () => {
                if (zoomModal && zoomImage) {
                    zoomImage.src = img.src;
                    zoomModal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                }
            });
        });
        
        // Botón de lupa también abre el modal
        if (zoomBtn) {
            zoomBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const currentImg = slides[currentSlide].querySelector('img');
                if (currentImg && zoomModal && zoomImage) {
                    zoomImage.src = currentImg.src;
                    zoomModal.classList.add('show');
                    document.body.style.overflow = 'hidden';
                }
            });
        }
    }
    
    // Cerrar modal
    if (zoomClose) {
        zoomClose.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (zoomModal) {
                zoomModal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }
    
    if (zoomModal) {
        zoomModal.addEventListener('click', (e) => {
            if (e.target === zoomModal) {
                zoomModal.classList.remove('show');
                document.body.style.overflow = '';
            }
        });
    }
    
    const productType = carouselId.split('-')[1];
    
    // Add event listeners for carousel buttons
    document.querySelectorAll(`[data-carousel="${productType}"]`).forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
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
    console.log('Showing section:', sectionId);
    showSection(sectionId);
}

// Setup navigation
function setupNavigation() {
    console.log('Setting up navigation');
    
    window.addEventListener('hashchange', () => {
        console.log('Hash changed to:', window.location.hash);
        showSectionBasedOnHash();
    });
    
    document.querySelectorAll('.back-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Back link clicked');
            window.location.hash = 'tienda';
            showSectionBasedOnHash();
        });
    });
    
    document.querySelectorAll('nav a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            console.log('Nav link clicked, going to:', targetId);
            window.location.hash = targetId;
            showSectionBasedOnHash();
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
