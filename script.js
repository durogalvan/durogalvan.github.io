// Stock data from the provided table
const stock = {
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

// Initialize stock display
function initializeStock() {
    // Update white shirt stock info in main page
    const whiteStockElement = document.getElementById('white-stock');
    let whiteStockText = 'Disponible: ';
    for (const size in stock.white) {
        whiteStockText += `${size}: ${stock.white[size]} | `;
    }
    whiteStockElement.textContent = whiteStockText.slice(0, -3);

    // Update black shirt stock info in main page
    const blackStockElement = document.getElementById('black-stock');
    let blackStockText = 'Disponible: ';
    for (const size in stock.black) {
        blackStockText += `${size}: ${stock.black[size]} | `;
    }
    blackStockElement.textContent = blackStockText.slice(0, -3);

    // Update white shirt stock info in detail page
    const whiteStockDetailElement = document.getElementById('white-stock-detail');
    if (whiteStockDetailElement) {
        whiteStockDetailElement.textContent = whiteStockText.slice(0, -3);
    }

    // Update black shirt stock info in detail page
    const blackStockDetailElement = document.getElementById('black-stock-detail');
    if (blackStockDetailElement) {
        blackStockDetailElement.textContent = blackStockText.slice(0, -3);
    }

    // Mark sold out sizes
    markSoldOutSizes('white');
    markSoldOutSizes('black');
}

// Mark sold out sizes
function markSoldOutSizes(product) {
    const sizes = document.querySelectorAll(`.size[data-product="${product}"]`);
    sizes.forEach(sizeElement => {
        const size = sizeElement.getAttribute('data-size');
        if (stock[product][size] <= 0) {
            sizeElement.classList.add('sold-out');
            sizeElement.textContent = `${size} (Agotado)`;
        }
    });
}

// Handle size selection
document.querySelectorAll('.size').forEach(sizeElement => {
    sizeElement.addEventListener('click', function() {
        if (this.classList.contains('sold-out')) return;
        
        // Remove selected class from all sizes of the same product
        const product = this.getAttribute('data-product');
        document.querySelectorAll(`.size[data-product="${product}"]`).forEach(el => {
            el.classList.remove('selected');
        });
        
        // Add selected class to clicked size
        this.classList.add('selected');
        
        // Update selected product display
        const size = this.getAttribute('data-size');
        const productName = product === 'white' ? 'Camiseta Blanca' : 'Camiseta Negra';
        document.getElementById('selected-product').textContent = `${productName} - Talla ${size}`;
    });
});

// Handle payment method selection
document.querySelectorAll('.payment-option').forEach(option => {
    option.addEventListener('click', function() {
        // Remove selected class from all payment options
        document.querySelectorAll('.payment-option').forEach(el => {
            el.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        this.classList.add('selected');
        
        // Show/hide IBAN info based on selection
        const paymentMethod = this.getAttribute('data-payment');
        const ibanInfo = document.getElementById('iban-info');
        if (paymentMethod === 'transfer') {
            ibanInfo.classList.add('show');
        } else {
            ibanInfo.classList.remove('show');
        }
    });
});

// Handle form submission
document.getElementById('reservation-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get selected product and size
    const selectedSize = document.querySelector('.size.selected');
    if (!selectedSize) {
        alert('Por favor, selecciona una talla de camiseta');
        return;
    }
    
    const product = selectedSize.getAttribute('data-product');
    const size = selectedSize.getAttribute('data-size');
    
    // Check if selected size is available
    if (stock[product][size] <= 0) {
        alert('Lo sentimos, esta talla ya no está disponible');
        return;
    }
    
    // Get payment method
    const selectedPayment = document.querySelector('.payment-option.selected');
    if (!selectedPayment) {
        alert('Por favor, selecciona un método de pago');
        return;
    }
    
    const paymentMethod = selectedPayment.getAttribute('data-payment');
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        product: product === 'white' ? 'Camiseta Blanca' : 'Camiseta Negra',
        size: size,
        payment: paymentMethod === 'transfer' ? 'Transferencia' : 'En mano',
        notes: document.getElementById('notes').value,
        timestamp: new Date().toISOString()
    };
    
    // URL de tu Google Apps Script (con tu ID específico)
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbySuEqwHvIVTAM4TcGJ0EgQdJ6X0Z0MVeCe9EFd8-yqnM_8NBgmVwss_l0oXs7LTCKU/exec';
    
    // Mostrar indicador de carga
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Procesando reserva...';
    submitButton.disabled = true;
    
    // Enviar datos a Google Apps Script
    fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error de red: ' + response.status);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert('¡Reserva realizada con éxito! Te hemos enviado un email de confirmación. ID de reserva: ' + data.reservationId);
            
            // Actualizar stock localmente
            stock[product][size]--;
            initializeStock();
            
            // Reset form
            this.reset();
            document.querySelectorAll('.size.selected').forEach(el => {
                el.classList.remove('selected');
            });
            document.querySelectorAll('.payment-option.selected').forEach(el => {
                el.classList.remove('selected');
            });
            document.getElementById('iban-info').classList.remove('show');
            document.getElementById('selected-product').textContent = 'Por favor, selecciona una talla de camiseta';
        } else {
            alert('Error al procesar la reserva: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Hubo un error al procesar la reserva. Por favor, inténtalo de nuevo o contacta con nosotros directamente en durogalvanband@gmail.com.');
    })
    .finally(() => {
        // Restaurar el botón
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    });
});

// Carrusel functionality
function initializeCarousel(carouselId, dotsContainerId) {
    const carousel = document.getElementById(carouselId);
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dotsContainer = document.getElementById(dotsContainerId);
    const productType = carouselId.split('-')[1]; // 'white' or 'black'
    
    let currentSlide = 0;
    
    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            goToSlide(index);
        });
        dotsContainer.appendChild(dot);
    });
    
    // Function to go to specific slide
    function goToSlide(slideIndex) {
        currentSlide = slideIndex;
        carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Update dots
        dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
    
    // Auto-advance slides every 5 seconds
    let slideInterval = setInterval(() => {
        nextSlide();
    }, 5000);
    
    // Next slide function
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        goToSlide(currentSlide);
    }
    
    // Previous slide function
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        goToSlide(currentSlide);
    }
    
    // Add event listeners for carousel buttons
    document.querySelectorAll(`[data-carousel="${productType}"]`).forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('carousel-next')) {
                nextSlide();
            } else {
                prevSlide();
            }
            
            // Reset auto-advance timer
            clearInterval(slideInterval);
            slideInterval = setInterval(() => {
                nextSlide();
            }, 5000);
        });
    });
    
    // Pause auto-advance on hover
    carousel.parentElement.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });
    
    carousel.parentElement.addEventListener('mouseleave', () => {
        clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            nextSlide();
        }, 5000);
    });
}

// Funcionalidad de Zoom para las imágenes del carrusel
function setupImageZoom() {
    const modal = document.getElementById('modalZoom');
    const zoomedImage = document.getElementById('zoomedImage');
    const closeZoom = document.querySelector('.close-zoom');
    const zoomInBtn = document.getElementById('zoomIn');
    const zoomOutBtn = document.getElementById('zoomOut');
    const resetZoomBtn = document.getElementById('resetZoom');
    const zoomIndicator = document.getElementById('zoomIndicator');
    
    let currentScale = 1;
    let minScale = 0.5;
    let maxScale = 3;
    let isDragging = false;
    let startX, startY, translateX = 0, translateY = 0;

    // Abrir modal al hacer click en cualquier imagen del carrusel
    document.querySelectorAll('.carousel-slide img').forEach(img => {
        img.addEventListener('click', function() {
            modal.classList.add('active');
            zoomedImage.src = this.src;
            zoomedImage.alt = this.alt;
            currentScale = 1;
            translateX = 0;
            translateY = 0;
            updateZoomTransform();
            updateZoomIndicator();
        });
    });

    function updateZoomTransform() {
        zoomedImage.style.transform = `scale(${currentScale}) translate(${translateX}px, ${translateY}px)`;
    }

    function updateZoomIndicator() {
        zoomIndicator.textContent = Math.round(currentScale * 100) + '%';
    }

    // Cerrar modal
    closeZoom.addEventListener('click', function() {
        modal.classList.remove('active');
        currentScale = 1;
        translateX = 0;
        translateY = 0;
    });

    // Cerrar modal al hacer click fuera de la imagen
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
            currentScale = 1;
            translateX = 0;
            translateY = 0;
        }
    });

    // Zoom in
    zoomInBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (currentScale < maxScale) {
            currentScale += 0.25;
            updateZoomTransform();
            updateZoomIndicator();
        }
    });

    // Zoom out
    zoomOutBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (currentScale > minScale) {
            currentScale -= 0.25;
            updateZoomTransform();
            updateZoomIndicator();
        }
    });

    // Reset zoom
    resetZoomBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        updateZoomTransform();
        updateZoomIndicator();
    });

    // Arrastrar imagen cuando está zoomada
    zoomedImage.addEventListener('mousedown', startDrag);
    zoomedImage.addEventListener('touchstart', startDrag);
    
    function startDrag(e) {
        if (currentScale <= 1) return;
        
        isDragging = true;
        const event = e.type === 'touchstart' ? e.touches[0] : e;
        startX = event.clientX - translateX;
        startY = event.clientY - translateY;
        
        e.preventDefault();
    }

    function drag(e) {
        if (!isDragging) return;
        
        const event = e.type === 'touchmove' ? e.touches[0] : e;
        const newTranslateX = event.clientX - startX;
        const newTranslateY = event.clientY - startY;
        
        // Limitar el desplazamiento para que no se salga demasiado
        const maxTranslate = 100 * currentScale;
        translateX = Math.max(Math.min(newTranslateX, maxTranslate), -maxTranslate);
        translateY = Math.max(Math.min(newTranslateY, maxTranslate), -maxTranslate);
        
        updateZoomTransform();
    }

    function stopDrag() {
        isDragging = false;
    }

    // Event listeners
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);

    // Cerrar con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            currentScale = 1;
            translateX = 0;
            translateY = 0;
        }
    });

    // Zoom con rueda del ratón
    modal.addEventListener('wheel', function(e) {
        e.preventDefault();
        
        if (e.deltaY < 0) {
            // Zoom in
            if (currentScale < maxScale) {
                currentScale += 0.1;
            }
        } else {
            // Zoom out
            if (currentScale > minScale) {
                currentScale -= 0.1;
            }
        }
        
        updateZoomTransform();
        updateZoomIndicator();
    }, { passive: false });
}

// Navigation between sections
function showSection(sectionId) {
    // Hide all product pages and show main sections
    document.querySelectorAll('.product-page').forEach(page => {
        page.style.display = 'none';
    });
    
    document.querySelectorAll('section:not(.product-page)').forEach(section => {
        section.style.display = 'block';
    });
    
    // If a product page is requested, show it and hide main sections
    if (sectionId === 'camiseta-blanca' || sectionId === 'camiseta-negra') {
        document.querySelectorAll('section:not(.product-page)').forEach(section => {
            section.style.display = 'none';
        });
        
        document.getElementById(sectionId).style.display = 'block';
        
        // Initialize carousel for the product page
        if (sectionId === 'camiseta-blanca') {
            initializeCarousel('carousel-white', 'carousel-dots-white');
        } else {
            initializeCarousel('carousel-black', 'carousel-dots-black');
        }
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Handle hash changes for navigation
window.addEventListener('hashchange', function() {
    const sectionId = window.location.hash.substring(1);
    showSection(sectionId);
});

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeStock();
    setupImageZoom();
    
    // Show appropriate section based on initial hash
    const initialSection = window.location.hash.substring(1) || 'inicio';
    showSection(initialSection);
});
