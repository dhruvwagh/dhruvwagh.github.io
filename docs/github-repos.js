// GitHub repository fetcher and renderer
const githubUsername = 'dhruvwagh'; // Your GitHub username
const repoCount = 10; // Number of repos to fetch

// Detect mobile devices
function isMobileDevice() {
    return (window.innerWidth <= 768) || 
           ('ontouchstart' in window) || 
           (navigator.maxTouchPoints > 0) || 
           (navigator.msMaxTouchPoints > 0);
}

async function fetchGitHubRepos() {
    try {
        // Fetch repositories sorted by last updated
        const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=${repoCount}`);
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }
        
        const repos = await response.json();
        return repos;
    } catch (error) {
        console.error('Error fetching GitHub repositories:', error);
        return [];
    }
}

function getLanguageColor(language) {
    // Map of languages to their GitHub color codes
    const colors = {
        'HTML': '#e34c26',
        'CSS': '#563d7c',
        'JavaScript': '#f1e05a',
        'TypeScript': '#3178c6',
        'Python': '#3572A5',
        'Java': '#b07219',
        'C': '#555555',
        'C++': '#f34b7d',
        'C#': '#178600',
        'Go': '#00ADD8',
        'Ruby': '#701516',
        'PHP': '#4F5D95',
        'Swift': '#ffac45',
        'Kotlin': '#A97BFF',
        'Rust': '#dea584',
        'Scala': '#c22d40',
        'Verilog': '#b07219',
        'VHDL': '#543978'
    };
    
    return colors[language] || '#8f8f8f'; // Default gray color if language not found
}

function generateDescription(repo) {
    // First check if the repo already has a valid description
    if (repo.description && repo.description.trim() !== '') {
        return repo.description;
    }
    
    // Generate a description based on repo name and other properties
    // Format the repository name for better readability
    const formattedName = repo.name
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1') // Add spaces before capital letters
        .trim();
    
    const descriptionParts = [];
    
    // Type of project based on language
    if (repo.language) {
        const lang = repo.language.toLowerCase();
        if (lang === 'html' || lang === 'css' || lang === 'javascript') {
            descriptionParts.push('Web development project');
        } else if (lang === 'python') {
            descriptionParts.push('Python application');
        } else if (lang === 'java') {
            descriptionParts.push('Java application');
        } else if (lang === 'c' || lang === 'c++') {
            descriptionParts.push('C/C++ implementation');
        } else if (lang === 'verilog' || lang === 'vhdl') {
            descriptionParts.push('Hardware description implementation');
        } else {
            descriptionParts.push(`${repo.language} project`);
        }
    } else {
        descriptionParts.push('Software project');
    }
    
    // When it was created
    if (repo.created_at) {
        const createdDate = new Date(repo.created_at);
        const createdYear = createdDate.getFullYear();
        const currentYear = new Date().getFullYear();
        if (createdYear === currentYear) {
            descriptionParts.push('created this year');
        } else {
            descriptionParts.push(`created in ${createdYear}`);
        }
    }
    
    // Is it a fork?
    if (repo.fork) {
        descriptionParts.push('forked from another repository');
    }
    
    // Does it have GitHub Pages?
    if (repo.has_pages) {
        descriptionParts.push('with a GitHub Pages website');
    }
    
    // Add repository name
    return `${descriptionParts.join(' ')} focused on ${formattedName}.`;
}

function truncateDescription(description, maxLength = 120) {
    // If description is empty or just whitespace, provide a default
    if (!description || description.trim() === '') {
        return 'Repository for code storage and version control.';
    }
    
    // Truncate if longer than maxLength
    if (description.length > maxLength) {
        return description.substring(0, maxLength) + '...';
    }
    
    return description;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

function createRepoCard(repo) {
    // Main language for the repository
    const language = repo.language || 'No language specified';
    
    // Generate a proper description - force regeneration if empty
    let description = generateDescription(repo);
    
    // Format the date
    const updatedDate = formatDate(repo.updated_at);
    
    // Check if we're on mobile
    const isMobile = isMobileDevice();
    
    // Create HTML for the repo card
    return `
        <div class="swiper-slide">
            <div class="github-card">
                <div class="github-card-header">
                    <i class="fab fa-github"></i>
                    <h3>${repo.name}</h3>
                </div>
                <div class="github-card-body">
                    <p class="repo-description">${truncateDescription(description, isMobile ? 80 : 120)}</p>
                    <p class="repo-updated">Updated: ${updatedDate}</p>
                </div>
                <div class="github-card-footer">
                    <span class="language">
                        <span class="language-dot" style="background-color: ${getLanguageColor(language)};"></span>
                        ${language}
                    </span>
                    <a href="${repo.html_url}" target="_blank" class="repo-link">
                        View Repo <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
}

async function initializeGitHubCarousel() {
    const repos = await fetchGitHubRepos();
    const swiperWrapper = document.querySelector('.swiper-wrapper');
    
    // Clear any existing content
    if (swiperWrapper) {
        swiperWrapper.innerHTML = '';
        
        // Add repo cards to the carousel
        if (repos.length > 0) {
            repos.forEach(repo => {
                swiperWrapper.innerHTML += createRepoCard(repo);
            });
        } else {
            // Fallback content if no repos are found
            swiperWrapper.innerHTML = `
                <div class="swiper-slide">
                    <div class="github-card">
                        <div class="github-card-header">
                            <i class="fab fa-github"></i>
                            <h3>GitHub Repositories</h3>
                        </div>
                        <div class="github-card-body">
                            <p class="repo-description">No repositories found. Please check back later or visit my GitHub profile directly.</p>
                        </div>
                        <div class="github-card-footer">
                            <a href="https://github.com/${githubUsername}" target="_blank" class="repo-link">
                                Visit Profile <i class="fas fa-external-link-alt"></i>
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Initialize or update Swiper after content is loaded
        if (window.swiper) {
            window.swiper.update();
        } else {
            initializeSwiper();
        }
    }
}

function initializeSwiper() {
    const isMobile = isMobileDevice();
    
    // Base configuration
    const swiperConfig = {
        slidesPerView: 1,
        spaceBetween: isMobile ? 20 : 30,
        loop: true,
        loopAdditionalSlides: 3,
        centeredSlides: isMobile,
        initialSlide: 0,
        observer: true,
        observeParents: true,
        updateOnWindowResize: true,
        watchOverflow: true,
        grabCursor: true,
        
        // Enhanced touch support - more sensitive on mobile
        touchRatio: isMobile ? 2 : 1.5,
        simulateTouch: true,
        shortSwipes: true,
        longSwipesRatio: isMobile ? 0.4 : 0.5,
        
        // Mousewheel support (mainly for desktop)
        mousewheel: {
            enabled: !isMobile,
            invert: false,
            forceToAxis: false,
            sensitivity: 1.5,
            eventsTarget: '.swiper-container'
        },
        
        // Keyboard navigation (mainly for desktop)
        keyboard: {
            enabled: !isMobile,
            onlyInViewport: true,
            pageUpDown: false
        },
        
        // Different autoplay behavior based on device
        autoplay: {
            delay: isMobile ? 4000 : 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: !isMobile
        },
        
        // Pagination is especially important on mobile
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
        },
        
        // Navigation arrows (can be hidden on mobile via CSS)
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        
        // Responsive breakpoints
        breakpoints: {
            // when window width is >= 768px (tablets)
            768: {
                slidesPerView: 2,
                spaceBetween: 20,
                centeredSlides: false
            },
            // when window width is >= 1024px (desktop)
            1024: {
                slidesPerView: 3,
                spaceBetween: 30,
                centeredSlides: false
            }
        },
        
        on: {
            init: function() {
                console.log('Swiper initialized with ' + this.slides.length + ' slides');
            },
            // Add appropriate event listeners based on device
            afterInit: function(swiper) {
                // Only add manual keyboard controls on desktop
                if (!isMobile) {
                    document.addEventListener('keydown', function(e) {
                        if (e.key === 'ArrowLeft') {
                            swiper.slidePrev();
                        } else if (e.key === 'ArrowRight') {
                            swiper.slideNext();
                        }
                    });
                    
                    // Setup additional mouse event listeners for desktop
                    const swiperContainer = document.querySelector('.swiper-container');
                    if (swiperContainer) {
                        let startX = 0;
                        let isDragging = false;
                        
                        swiperContainer.addEventListener('mousedown', function(e) {
                            isDragging = true;
                            startX = e.clientX;
                            e.preventDefault();
                        });
                        
                        document.addEventListener('mousemove', function(e) {
                            if (!isDragging) return;
                            const diffX = e.clientX - startX;
                            if (Math.abs(diffX) > 50) { // Threshold for swipe
                                if (diffX > 0) {
                                    swiper.slidePrev();
                                } else {
                                    swiper.slideNext();
                                }
                                isDragging = false;
                            }
                        });
                        
                        document.addEventListener('mouseup', function() {
                            isDragging = false;
                        });
                    }
                }
            },
            // Update mobile detection on resize
            resize: function() {
                this.params.touchRatio = isMobileDevice() ? 2 : 1.5;
                this.params.centeredSlides = isMobileDevice();
                this.params.mousewheel.enabled = !isMobileDevice();
                this.params.keyboard.enabled = !isMobileDevice();
            }
        }
    };
    
    window.swiper = new Swiper('.swiper-container', swiperConfig);
}

// Handle resize events to adapt between mobile and desktop views
window.addEventListener('resize', function() {
    if (window.swiper) {
        window.swiper.params.touchRatio = isMobileDevice() ? 2 : 1.5;
        window.swiper.params.centeredSlides = isMobileDevice();
        window.swiper.update();
    }
});

// Initialize GitHub repository carousel when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeGitHubCarousel();
    
    // Set up refresh every 5 minutes (300000 ms)
    setInterval(initializeGitHubCarousel, 300000);
}); 