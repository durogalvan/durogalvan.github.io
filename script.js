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

// Global variables to track selections
let selectedSize = {
    white: null,
    black: null
};

let selectedPayment = {
    white: null,
    black: null
};

// Initialize stock display
function initializeStock() {
    updateStockDisplay();
    markSoldOutSizes('white');
    markSoldOutSizes('black');
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
        if (stock[product][size] <= 0) {
            sizeElement.classList.add('sold-out');
            sizeElement.textContent = `${size} (Agotado)`;
            sizeElement.style.cursor = 'not-allowed';
            sizeElement.style.opacity = '0.6';
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
            
            // Remove selected class from all sizes of the same product
            document.querySelectorAll(`.size[data-product="${product}"]`).forEach(el => {
                el.classList.remove('selected');
            });
            
            // Add selected class to clicked size
            this.classList.add('selected');
            
            // Store selection
            selectedSize[product] = size;
            
            // Update selected product display
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
            
            // Remove selected class from all payment options in this form
            form.querySelectorAll('.payment-option').forEach(el => {
                el.classList.remove('selected');
            });
            
            // Add selected class to clicked option
            this.classList.add('selected');
            
            // Store selection
            selectedPayment[product] = this.getAttribute('data-payment');
            
            // Show/hide IBAN info based on selection
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
function handleReservationFormSubmit(form, product) {
    // Validate size selection
    if (!selectedSize[product]) {
        alert('Por favor, selecciona una talla de camiseta');
        return;
    }
    
    const size = selectedSize[product];
    
    // Check if selected size is available
    if (stock[product][size] <= 0) {
        alert('Lo sentimos, esta talla ya no está disponible');
        return;
    }
    
    // Validate payment method selection
    if (!selectedPayment[product]) {
        alert('Por favor, selecciona un método de pago');
        return;
    }
    
    // Get form data
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
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.phone) {
        alert('Por favor, completa todos los campos obligatorios');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        alert('Por favor, introduce un email válido');
        return;
    }
    
    // URL de tu Google Apps Script (ACTUALIZADA CON TU ID)
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzEWMDVelvduAqeTl5HNzqscDttSN2GZUVb8qQebep15TSamP5AXYIxSySjqwoRD1N0/exec';
    
    // Mostrar indicador de carga
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Procesando reserva...';
    submitButton.disabled = true;
    
    console.log('Enviando datos al Google Apps Script:', formData);
    
    // Enviar datos a Google Apps Script con mejor manejo de errores
    fetch(scriptUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        console.log('Respuesta recibida, status:', response.status);
        
        if (!response.ok) {
            // Si la respuesta no es OK, intentamos leer el cuerpo del error
            return response.text().then(text => {
                throw new Error(`Error del servidor: ${response.status} - ${text}`);
            });
        }
        return response.json();
    })
    .then(data => {
        console.log('Datos procesados:', data);
        
        if (data.success) {
            alert('¡Reserva realizada con éxito! Te hemos enviado un email de confirmación. ID de reserva: ' + data.reservationId);
            
            // Actualizar stock localmente
            stock[product][size]--;
            initializeStock();
            
            // Reset form and selections
            form.reset();
            resetSelections(product);
            
            // Redirect to main shop after successful reservation
            setTimeout(() => {
                window.location.hash = '#tienda';
                showSectionBasedOnHash();
            }, 2000);
        } else {
            throw new Error(data.error || 'Error desconocido del servidor');
        }
    })
    .catch(error => {
        console.error('Error completo:', error);
        
        // Mensaje de error más específico
        let errorMessage = 'Hubo un error al procesar la reserva. ';
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage += 'No se pudo conectar con el servidor. ';
        } else if (error.message.includes('NetworkError')) {
            errorMessage += 'Error de conexión. ';
        } else if (error.message.includes('CORS')) {
            errorMessage += 'Error de configuración CORS. ';
        }
        
        errorMessage += 'Por favor, inténtalo de nuevo o contacta con nosotros directamente en durogalvanband@gmail.com.';
        
        alert(errorMessage);
    })
    .finally(() => {
        // Restaurar el botón
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    });
}

function resetSelections(product) {
    selectedSize[product] = null;
    selectedPayment[product] = null;
    
    // Reset UI selections
    document.querySelectorAll(`.size[data-product="${product}"]`).forEach(el => {
        el.classList.remove('selected');
    });
    
    document.querySelectorAll(`#reservation-form-${product} .payment-option`).forEach(el => {
        el.classList.remove('selected');
    });
    
    document.querySelectorAll(`#reservation-form-${product} .iban-info`).forEach(el => {
        el.classList.remove('show');
    });
    
    // Reset selected product display
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

// Enhanced carousel functionality
function initializeCarousel(carouselId, dotsContainerId) {
    const carousel = document.getElementById(carouselId);
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dotsContainer = document.getElementById(dotsContainerId);
    const productType = carouselId.split('-')[1];
    
    let currentSlide = 0;
    
    // Clear existing dots
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
    }
    
    // Create dots
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dot');
        if (index === 0) dot.classList.add('active');
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
        
        // Update dots
        if (dotsContainer) {
            dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }
    }
    
    // Auto-advance slides every 5 seconds
    let slideInterval = setInterval(() => {
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

// Function to show a specific section
function showSection(sectionId) {
    // Hide all sections first
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show the requested section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        
        // Initialize carousels if we're on a product page
        if (sectionId === 'camiseta-blanca') {
            initializeCarousel('carousel-white', 'carousel-dots-white');
        } else if (sectionId === 'camiseta-negra') {
            initializeCarousel('carousel-black', 'carousel-dots-black');
        }
        
        // Re-initialize event listeners for form elements
        setTimeout(() => {
            setupSizeSelection();
            setupPaymentSelection();
        }, 100);
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Function to handle hash changes and show appropriate section
function showSectionBasedOnHash() {
    const hash = window.location.hash.substring(1);
    const sectionId = hash || 'inicio';
    showSection(sectionId);
}

// Setup navigation
function setupNavigation() {
    // Handle hash changes for navigation
    window.addEventListener('hashchange', showSectionBasedOnHash);
    
    // Handle direct clicks on product links
    document.querySelectorAll('a[href="#camiseta-blanca"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('camiseta-blanca');
            window.location.hash = 'camiseta-blanca';
        });
    });
    
    document.querySelectorAll('a[href="#camiseta-negra"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('camiseta-negra');
            window.location.hash = 'camiseta-negra';
        });
    });
    
    // Handle back links
    document.querySelectorAll('.back-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.hash = 'tienda';
        });
    });
    
    // Handle main navigation links
    document.querySelectorAll('nav a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            window.location.hash = targetId;
        });
    });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeStock();
    setupSizeSelection();
    setupPaymentSelection();
    setupFormSubmission();
    setupNavigation();
    
    // Show appropriate section based on initial hash
    showSectionBasedOnHash();
});
