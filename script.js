// Stock data from the provided table
const stock = {
    white: {
        S: 5,
        M: 30,
        L: 41,
        XL: 21,
        XXL: 10
    },
    black: {
        S: 5,
        M: 30,
        L: 41,
        XL: 21,
        XXL: 10
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
            
            // Actualizar stock localmente
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

// Carrusel DINÁMICO que se adapta a cada imagen
function initializeCarousel(carouselId, dotsContainerId) {
    const carousel = document.getElementById(carouselId);
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dotsContainer = document.getElementById(dotsContainerId);
    const productType = carouselId.split('-')[1]; // 'white' or 'black'
    
    let currentSlide = 0;
    
    // Analizar cada imagen y aplicar clase según orientación
    slides.forEach((slide, index) => {
        const img = slide.querySelector('img');
        const tempImg = new Image();
        
        tempImg.onload = function() {
            const aspectRatio = this.width / this.height;
            
            // Determinar orientación y aplicar clase correspondiente
            if (aspectRatio > 1) {
                // Imagen horizontal
                slide.classList.add('landscape');
            } else {
                // Imagen vertical
                slide.classList.add('portrait');
            }
            
            // Si es la primera imagen, inicializar
            if (index === 0) {
                updateCarouselHeight();
            }
        };
        
        tempImg.src = img.src;
    });
    
    // Función para actualizar la altura del carrusel según la imagen actual
    function updateCarouselHeight() {
        const currentSlideElement = slides[currentSlide];
        const img = currentSlideElement.querySelector('img');
        
        if (img && img.naturalHeight) {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            const container = carousel.parentElement;
            
            // Ajustar altura según orientación
            if (aspectRatio > 1.5) {
                // Muy horizontal - altura menor
                container.style.height = '400px';
            } else if (aspectRatio > 1) {
                // Horizontal estándar
                container.style.height = '450px';
            } else if (aspectRatio > 0.7) {
                // Cuadrada o casi
                container.style.height = '500px';
            } else {
                // Vertical
                container.style.height = '550px';
            }
        }
    }
    
    // Create dots
    dotsContainer.innerHTML = ''; // Limpiar dots existentes
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
        
        // Actualizar altura del carrusel
        updateCarouselHeight();
        
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
    
    // Ajustar altura al redimensionar ventana
    window.addEventListener('resize', updateCarouselHeight);
}

// Funcionalidad de Zoom MEJORADA para las imágenes del carrusel
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
    let currentImageAspectRatio = 1;

    // Abrir modal al hacer click en cualquier imagen del carrusel
    document.querySelectorAll('.carousel-slide img').forEach(img => {
        img.addEventListener('click', function() {
            const imgSrc = this.src;
            const img = new Image();
            img.onload = function() {
                currentImageAspectRatio = this.width / this.height;
                openZoomModal(imgSrc, this.alt);
            };
            img.src = imgSrc;
        });
    });

    function openZoomModal(src, alt) {
        modal.classList.add('active');
        zoomedImage.src = src;
        zoomedImage.alt = alt;
        
        // Resetear transformaciones
        currentScale = 1;
        translateX = 0;
        translateY = 0;
        updateZoomTransform();
        updateZoomIndicator();
        
        // Centrar la imagen
        setTimeout(centerImage, 100);
    }

    function centerImage() {
        translateX = 0;
        translateY = 0;
        updateZoomTransform();
    }

    function updateZoomTransform() {
        zoomedImage.style.transform = `scale(${currentScale}) translate(${translateX}px, ${translateY}px)`;
    }

    function updateZoomIndicator() {
        zoomIndicator.textContent = Math.round(currentScale * 100) + '%';
    }

    // Cerrar modal
    closeZoom.addEventListener('click', closeZoomModal);

    function closeZoomModal() {
        modal.classList.remove('active');
        currentScale = 1;
        translateX = 0;
        translateY = 0;
    }

    // Cerrar modal al hacer click fuera de la imagen
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeZoomModal();
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
            
            // Si el zoom es muy pequeño, centrar la imagen
            if (currentScale <= 1) {
                translateX = 0;
                translateY = 0;
            }
            
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
        zoomedImage.classList.add('dragging');
        
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
        zoomedImage.classList.remove('dragging');
    }

    // Event listeners mejorados
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);

    // Cerrar con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeZoomModal();
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
                
                // Si el zoom es muy pequeño, centrar la imagen
                if (currentScale <= 1) {
                    translateX = 0;
                    translateY = 0;
                }
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
        
        const productSection = document.getElementById(sectionId);
        if (productSection) {
            productSection.style.display = 'block';
            
            // Pequeño delay para asegurar que el DOM esté listo
            setTimeout(() => {
                if (sectionId === 'camiseta-blanca') {
                    initializeCarousel('carousel-white', 'carousel-dots-white');
                } else {
                    initializeCarousel('carousel-black', 'carousel-dots-black');
                }
            }, 100);
            
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
    initializeStock();
    setupSizeSelection();
    setupPaymentSelection();
    setupFormSubmission();
    setupNavigation();
    setupImageZoom();
    
    // Show appropriate section based on initial hash
    const initialSection = window.location.hash.substring(1) || 'inicio';
    showSection(initialSection);
});
