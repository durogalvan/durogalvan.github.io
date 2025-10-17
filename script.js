// Stock data - se actualizará automáticamente desde Google Sheets
let stock = {
    white: {
        S: 0, M: 0, L: 0, XL: 0, XXL: 0
    },
    black: {
        S: 0, M: 0, L: 0, XL: 0, XXL: 0
    }
};

// Función para obtener stock actualizado desde Google Sheets
async function updateStockFromSheets() {
    try {
        const scriptUrl = 'https://script.google.com/macros/s/AKfycbySuEqwHvIVTAM4TcGJ0EgQdJ6X0Z0MVeCe9EFd8-yqnM_8NBgmVwss_l0oXs7LTCKU/exec';
        const response = await fetch(`${scriptUrl}?action=getStock`);
        const data = await response.json();
        
        if (data.success) {
            // Convertir los nombres de productos a los que usa nuestra página
            stock.white = data.stock['Camiseta Blanca'];
            stock.black = data.stock['Camiseta Negra'];
            initializeStock();
        }
    } catch (error) {
        console.error('Error actualizando stock:', error);
    }
}

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
        } else {
            // Asegurarse de quitar la clase sold-out si ahora hay stock
            sizeElement.classList.remove('sold-out');
            sizeElement.textContent = size;
        }
    });
}

// Handle size selection
function setupSizeSelection() {
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
            
            // Update in main form
            const selectedProductElement = document.getElementById('selected-product');
            if (selectedProductElement) {
                selectedProductElement.textContent = `${productName} - Talla ${size}`;
            }
            
            // Update in white product page
            const selectedProductWhiteElement = document.getElementById('selected-product-white');
            if (selectedProductWhiteElement) {
                selectedProductWhiteElement.textContent = `${productName} - Talla ${size}`;
            }
            
            // Update in black product page
            const selectedProductBlackElement = document.getElementById('selected-product-black');
            if (selectedProductBlackElement) {
                selectedProductBlackElement.textContent = `${productName} - Talla ${size}`;
            }
        });
    });
}

// Handle payment method selection
function setupPaymentSelection() {
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
            const form = this.closest('form');
            const ibanInfo = form ? form.querySelector('.iban-info') : document.getElementById('iban-info');
            if (paymentMethod === 'transfer') {
                ibanInfo.classList.add('show');
            } else {
                ibanInfo.classList.remove('show');
            }
        });
    });
}

// Handle form submission for main form
function setupFormSubmission() {
    document.getElementById('reservation-form')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleReservationFormSubmit(this, 'white');
    });

    // Handle form submission for white product page
    document.getElementById('reservation-form-white')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleReservationFormSubmit(this, 'white');
    });

    // Handle form submission for black product page
    document.getElementById('reservation-form-black')?.addEventListener('submit', function(e) {
        e.preventDefault();
        handleReservationFormSubmit(this, 'black');
    });
}

// Generic function to handle form submission
function handleReservationFormSubmit(form, defaultProduct) {
    // Get selected product and size
    const selectedSize = form.querySelector('.size.selected');
    if (!selectedSize) {
        alert('Por favor, selecciona una talla de camiseta');
        return;
    }
    
    const product = selectedSize.getAttribute('data-product') || defaultProduct;
    const size = selectedSize.getAttribute('data-size');
    
    // Check if selected size is available
    if (stock[product][size] <= 0) {
        alert('Lo sentimos, esta talla ya no está disponible');
        return;
    }
    
    // Get payment method
    const selectedPayment = form.querySelector('.payment-option.selected');
    if (!selectedPayment) {
        alert('Por favor, selecciona un método de pago');
        return;
    }
    
    const paymentMethod = selectedPayment.getAttribute('data-payment');
    
    // Get form data
    const nameInput = form.querySelector('input[type="text"]');
    const emailInput = form.querySelector('input[type="email"]');
    const phoneInput = form.querySelector('input[type="tel"]');
    const notesInput = form.querySelector('textarea');
    
    const formData = {
        name: nameInput.value,
        email: emailInput.value,
        phone: phoneInput.value,
        product: product === 'white' ? 'Camiseta Blanca' : 'Camiseta Negra',
        size: size,
        payment: paymentMethod === 'transfer' ? 'Transferencia' : 'En mano',
        notes: notesInput ? notesInput.value : '',
        timestamp: new Date().toISOString()
    };
    
    // URL de tu Google Apps Script (con tu ID específico)
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbySuEqwHvIVTAM4TcGJ0EgQdJ6X0Z0MVeCe9EFd8-yqnM_8NBgmVwss_l0oXs7LTCKU/exec';
    
    // Mostrar indicador de carga
    const submitButton = form.querySelector('button[type="submit"]');
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
            
            // Actualizar stock localmente restando 1
            stock[product][size]--;
            initializeStock();
            
            // Reset form
            form.reset();
            form.querySelectorAll('.size.selected').forEach(el => {
                el.classList.remove('selected');
            });
            form.querySelectorAll('.payment-option.selected').forEach(el => {
                el.classList.remove('selected');
            });
            const ibanInfo = form.querySelector('.iban-info');
            if (ibanInfo) {
                ibanInfo.classList.remove('show');
            }
            
            // Reset selected product display
            const selectedProductElement = form.querySelector('#selected-product, #selected-product-white, #selected-product-black');
            if (selectedProductElement) {
                const productName = product === 'white' ? 'Camiseta Blanca' : 'Camiseta Negra';
                selectedProductElement.textContent = `${productName} - Por favor, selecciona una talla`;
            }
            
            // If we're on a product page, redirect to main shop after successful reservation
            if (form.id.includes('white') || form.id.includes('black')) {
                setTimeout(() => {
                    window.location.href = '#tienda';
                    showSection('tienda');
                }, 2000);
            }
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
}

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
        
        const productSection = document.getElementById(sectionId);
        if (productSection) {
            productSection.style.display = 'block';
            
            // Initialize carousel for the product page
            if (sectionId === 'camiseta-blanca') {
                initializeCarousel('carousel-white', 'carousel-dots-white');
            } else {
                initializeCarousel('carousel-black', 'carousel-dots-black');
            }
            
            // Re-initialize event listeners for the product page
            setupSizeSelection();
            setupPaymentSelection();
        }
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Setup navigation links
function setupNavigation() {
    // Handle hash changes for navigation
    window.addEventListener('hashchange', function() {
        const sectionId = window.location.hash.substring(1);
        showSection(sectionId);
    });
    
    // Handle direct clicks on product links
    document.querySelectorAll('a[href="#camiseta-blanca"], a[href="#camiseta-negra"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            window.location.hash = sectionId;
            showSection(sectionId);
        });
    });
    
    // Handle back links
    document.querySelectorAll('.back-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.hash = 'tienda';
            showSection('tienda');
        });
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Primero inicializamos el stock desde Google Sheets
    updateStockFromSheets().then(() => {
        // Luego inicializamos todo lo demás
        setupSizeSelection();
        setupPaymentSelection();
        setupFormSubmission();
        setupNavigation();
        
        // Show appropriate section based on initial hash
        const initialSection = window.location.hash.substring(1) || 'inicio';
        showSection(initialSection);
    });
});
