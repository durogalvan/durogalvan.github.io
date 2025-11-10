// Global variables
let stock = {
    'Blanca': { S: 5, M: 30, L: 41, XL: 21, XXL: 3 },
    'Negra': { S: 5, M: 30, L: 41, XL: 21, XXL: 3 }
};

const STOCK_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx4fbmrL9nbqJB6uZZHfQEKbb1CDMkSni92noF12c2RcTpW9yThKobb7owXp4GZsV74/exec?action=getStock';

// Animation utilities
const AnimationUtils = {
    // Intersection Observer for scroll animations
    observeElements: function() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);
        
        // Observe all animation elements
        document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in').forEach(el => {
            observer.observe(el);
        });
    },
    
    // Smooth scroll to element
    scrollTo: function(element, offset = 0) {
        const targetPosition = element.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    },
    
    // Animate element entrance
    animateIn: function(element, animation = 'fadeInUp') {
        if (animation === 'fadeInUp') {
            anime({
                targets: element,
                opacity: [0, 1],
                translateY: [30, 0],
                duration: 600,
                easing: 'easeOutQuart'
            });
        } else if (animation === 'slideInLeft') {
            anime({
                targets: element,
                opacity: [0, 1],
                translateX: [-50, 0],
                duration: 600,
                easing: 'easeOutQuart'
            });
        } else if (animation === 'scaleIn') {
            anime({
                targets: element,
                opacity: [0, 1],
                scale: [0.9, 1],
                duration: 600,
                easing: 'easeOutQuart'
            });
        }
    }
};

// Navigation utilities
const NavigationUtils = {
    init: function() {
        this.setupMobileMenu();
        this.setupSmoothScrolling();
        this.setupActiveStates();
        this.setupHashNavigation();
    },
    
    setupMobileMenu: function() {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mobileMenu = document.querySelector('.mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                
                // Animate hamburger
                const spans = mobileMenuBtn.querySelectorAll('span');
                if (mobileMenu.classList.contains('hidden')) {
                    spans[0].style.transform = 'rotate(0deg) translateY(0)';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'rotate(0deg) translateY(0)';
                } else {
                    spans[0].style.transform = 'rotate(45deg) translateY(8px)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'rotate(-45deg) translateY(-8px)';
                }
            });
            
            // Close mobile menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                    mobileMenu.classList.add('hidden');
                    const spans = mobileMenuBtn.querySelectorAll('span');
                    spans[0].style.transform = 'rotate(0deg) translateY(0)';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'rotate(0deg) translateY(0)';
                }
            });
        }
    },
    
    setupSmoothScrolling: function() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerOffset = 80;
                    AnimationUtils.scrollTo(target, headerOffset);
                    
                    // Update URL hash without jumping
                    history.pushState(null, null, this.getAttribute('href'));
                    
                    // Close mobile menu if open
                    const mobileMenu = document.querySelector('.mobile-menu');
                    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                        mobileMenu.classList.add('hidden');
                    }
                }
            });
        });
    },
    
    setupActiveStates: function() {
        const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
        
        function updateActiveStates() {
            const currentHash = window.location.hash || '#inicio';
            
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                if (href === currentHash) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
        
        window.addEventListener('hashchange', updateActiveStates);
        updateActiveStates();
    },
    
    setupHashNavigation: function() {
        window.addEventListener('hashchange', () => {
            showSectionBasedOnHash();
        });
    }
};

// Slider utilities
const SliderUtils = {
    init: function() {
        this.initializeDossierSlider();
        this.initializeProductGalleries();
    },
    
    initializeDossierSlider: function() {
        const dossierSlider = document.getElementById('dossier-splide');
        if (dossierSlider && typeof Splide !== 'undefined') {
            new Splide('#dossier-splide', {
                type: 'loop',
                autoplay: true,
                interval: 4000,
                speed: 1000,
                arrows: false,
                pagination: false,
                drag: true,
                wheel: false,
                pauseOnHover: false,
                pauseOnFocus: false
            }).mount();
        }
    },
    
    initializeProductGalleries: function() {
        // Initialize white gallery
        const whiteGallery = document.getElementById('white-gallery');
        if (whiteGallery && typeof Splide !== 'undefined') {
            new Splide('#white-gallery', {
                type: 'loop',
                arrows: true,
                pagination: true,
                drag: true,
                perPage: 1,
                gap: '1rem'
            }).mount();
        }
        
        // Initialize black gallery
        const blackGallery = document.getElementById('black-gallery');
        if (blackGallery && typeof Splide !== 'undefined') {
            new Splide('#black-gallery', {
                type: 'loop',
                arrows: true,
                pagination: true,
                drag: true,
                perPage: 1,
                gap: '1rem'
            }).mount();
        }
    }
};

// Stock management
const StockUtils = {
    init: function() {
        this.syncStockFromServer();
        this.setupStockSync();
    },
    
    syncStockFromServer: function() {
        console.log('=== Syncing Stock from Server ===');
        console.log('Fetching from:', STOCK_SCRIPT_URL);
        
        fetch(STOCK_SCRIPT_URL)
            .then(response => {
                console.log('Response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Full API Response:', JSON.stringify(data));
                
                if (data.success && data.stock) {
                    console.log('✓ Stock received successfully');
                    stock = data.stock;
                    console.log('Stock object updated to:', stock);
                    this.updateStockDisplay();
                    this.updateFormValidation();
                    console.log('Display and validation updated');
                } else {
                    console.warn('✗ API response not successful');
                    console.warn('Success:', data.success, 'Stock:', data.stock);
                    console.warn('Error:', data.error);
                    this.useLocalStock();
                }
            })
            .catch(error => {
                console.error('✗ Fetch error:', error);
                console.log('Using stock local...');
                this.useLocalStock();
            });
    },
    
    useLocalStock: function() {
        this.updateStockDisplay();
        this.updateFormValidation();
    },
    
    updateStockDisplay: function() {
        // Update white stock
        const whiteStockElements = document.querySelectorAll('#white-stock, #white-stock-detail');
        let whiteStockText = 'Disponible: ';
        for (const size in stock['Blanca']) {
            whiteStockText += `${size}: ${stock['Blanca'][size]} | `;
        }
        whiteStockElements.forEach(el => {
            if (el) el.textContent = whiteStockText.slice(0, -3);
        });

        // Update black stock
        const blackStockElements = document.querySelectorAll('#black-stock, #black-stock-detail');
        let blackStockText = 'Disponible: ';
        for (const size in stock['Negra']) {
            blackStockText += `${size}: ${stock['Negra'][size]} | `;
        }
        blackStockElements.forEach(el => {
            if (el) el.textContent = blackStockText.slice(0, -3);
        });
    },
    
    updateFormValidation: function() {
        this.updateAvailabilityWarnings();
    },
    
    updateAvailabilityWarnings: function() {
        this.updateAvailabilityWarning('white', stock['Blanca']);
        this.updateAvailabilityWarning('black', stock['Negra']);
    },
    
    updateAvailabilityWarning: function(product, stockData) {
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
    },
    
    setupStockSync: function() {
        setInterval(() => {
            this.syncStockFromServer();
        }, 30000); // Sync every 30 seconds
    }
};

// Section management
const SectionUtils = {
    showSection: function(sectionId) {
        // Hide all sections
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            
            // Initialize product galleries if needed
            if (sectionId === 'camiseta-blanca') {
                SliderUtils.initializeProductGalleries();
            } else if (sectionId === 'camiseta-negra') {
                SliderUtils.initializeProductGalleries();
            }
            
            // Animate section in
            AnimationUtils.animateIn(targetSection, 'fadeInUp');
            
            // Update navigation
            NavigationUtils.setupActiveStates();
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
    },
    
    showProductPage: function(productId) {
        this.showSection(productId);
    },
    
    showSectionBasedOnHash: function() {
        const hash = window.location.hash.substring(1);
        const sectionId = hash || 'inicio';
        
        // Special handling for product pages
        if (sectionId === 'camiseta-blanca' || sectionId === 'camiseta-negra') {
            this.showProductPage(sectionId);
        } else {
            this.showSection(sectionId);
        }
    }
};

// Form utilities
const FormUtils = {
    init: function() {
        this.setupContactForm();
    },
    
    setupContactForm: function() {
        const contactForm = document.querySelector('#contacto form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleContactSubmission(contactForm);
            });
        }
    },
    
    handleContactSubmission: function(form) {
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual endpoint)
        setTimeout(() => {
            // Show success message
            this.showAlert('Mensaje enviado correctamente', 'success');
            form.reset();
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    },
    
    showAlert: function(message, type = 'info') {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        
        // Add to page
        document.body.appendChild(alert);
        
        // Animate in
        anime({
            targets: alert,
            opacity: [0, 1],
            translateY: [-20, 0],
            duration: 300,
            easing: 'easeOutQuart'
        });
        
        // Remove after 5 seconds
        setTimeout(() => {
            anime({
                targets: alert,
                opacity: [1, 0],
                translateY: [0, -20],
                duration: 300,
                easing: 'easeOutQuart',
                complete: () => {
                    alert.remove();
                }
            });
        }, 5000);
    }
};

// Performance utilities
const PerformanceUtils = {
    init: function() {
        this.lazyLoadImages();
        this.optimizeAnimations();
    },
    
    lazyLoadImages: function() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    },
    
    optimizeAnimations: function() {
        // Reduce animations if user prefers reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--transition', 'none');
            document.documentElement.style.setProperty('--transition-slow', 'none');
        }
    }
};

// Error handling
const ErrorUtils = {
    init: function() {
        window.addEventListener('error', this.handleError);
        window.addEventListener('unhandledrejection', this.handlePromiseRejection);
    },
    
    handleError: function(event) {
        console.error('Global error:', event.error);
        // Could send to error reporting service
    },
    
    handlePromiseRejection: function(event) {
        console.error('Unhandled promise rejection:', event.reason);
        // Could send to error reporting service
    }
};

// Global functions (for backward compatibility)
function showProductPage(productId) {
    SectionUtils.showProductPage(productId);
}

function showSection(sectionId) {
    SectionUtils.showSection(sectionId);
}

function showSectionBasedOnHash() {
    SectionUtils.showSectionBasedOnHash();
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== Initializing Application ===');
    
    // Initialize all utilities
    NavigationUtils.init();
    SliderUtils.init();
    StockUtils.init();
    FormUtils.init();
    PerformanceUtils.init();
    ErrorUtils.init();
    
    // Initialize animations
    AnimationUtils.observeElements();
    
    // Show initial section
    showSectionBasedOnHash();
    
    console.log('=== Application Initialized ===');
});

// Export utilities for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AnimationUtils,
        NavigationUtils,
        SliderUtils,
        StockUtils,
        SectionUtils,
        FormUtils,
        PerformanceUtils,
        ErrorUtils
    };
}