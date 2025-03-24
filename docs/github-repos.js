// GitHub repository fetcher and renderer
const githubUsername = 'dhruvwagh'; // Your GitHub username
const repoCount = 10; // Number of repos to fetch

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

function truncateDescription(description, maxLength = 120) {
    if (!description) return 'No description provided.';
    return description.length > maxLength 
        ? description.substring(0, maxLength) + '...' 
        : description;
}

function createRepoCard(repo) {
    // Main language for the repository
    const language = repo.language || 'Unknown';
    
    // Create HTML for the repo card
    return `
        <div class="swiper-slide">
            <div class="github-card">
                <div class="github-card-header">
                    <i class="fab fa-github"></i>
                    <h3>${repo.name}</h3>
                </div>
                <p>${truncateDescription(repo.description)}</p>
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
                        <p>No repositories found. Please check back later or visit my GitHub profile directly.</p>
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
    window.swiper = new Swiper('.swiper-container', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            // when window width is >= 768px
            768: {
                slidesPerView: 2,
                spaceBetween: 20
            },
            // when window width is >= 1024px
            1024: {
                slidesPerView: 3,
                spaceBetween: 30
            }
        }
    });
}

// Initialize GitHub repository carousel when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeGitHubCarousel();
    
    // Set up refresh every 5 minutes (300000 ms)
    setInterval(initializeGitHubCarousel, 300000);
}); 