document.addEventListener('DOMContentLoaded', () => {
    const categorySelector = document.getElementById('category');
    const categoryTabs = document.querySelectorAll('.category-tabs button'); // Select tabs
    const topStoriesSection = document.querySelector('.top-stories');
    
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Apply the current theme on load
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.textContent = currentTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';

    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    });

    // Function to show a loading indicator
    const showLoader = () => {
      topStoriesSection.innerHTML = '<div class="loader">Loading...</div>';
    };
  
    // Function to render stories on the page
    const renderStories = (stories) => {
      topStoriesSection.innerHTML = ''; // Clear previous stories
      stories.forEach((story) => {
        const storyCard = document.createElement('div');
        storyCard.classList.add('story');
        storyCard.innerHTML = `
          <img src="${story.multimedia?.[0]?.url || 'placeholder.jpg'}" alt="Story image">
          <h3>${story.title}</h3>
          <p>${story.abstract}</p>
          <a href="${story.url}" target="_blank">Read more</a>
        `;
        topStoriesSection.appendChild(storyCard);
      });
    };
  
    // Function to fetch and cache stories
    const fetchAndCacheStories = async (category) => {
      const cachedStories = localStorage.getItem(`stories_${category}`);
      const cacheTimestamp = localStorage.getItem(`timestamp_${category}`);
  
      // Check if cache is valid  [Cache expiration time in milliseconds (10 minutes)]
      if (cachedStories && cacheTimestamp && Date.now() - cacheTimestamp < 600000) {
        console.log('Loading stories from cache');
        renderStories(JSON.parse(cachedStories));
      } else {
        console.log('Fetching stories from API');
        const API_KEY = 'Gnw9CcsNd9LYPYKsOvSAlCwy5SLOIKZQ';
        const URL = `https://api.nytimes.com/svc/topstories/v2/${category}.json?api-key=${API_KEY}`;
        try {
          showLoader(); // Show loader while fetching data
          const response = await axios.get(URL);
          const stories = response.data.results.slice(0, 5); // Limit to 5 stories
  
          // Cache the fetched stories
          localStorage.setItem(`stories_${category}`, JSON.stringify(stories));
          localStorage.setItem(`timestamp_${category}`, Date.now());
  
          renderStories(stories);
        } catch (error) {
          console.error('Error fetching stories:', error);
          topStoriesSection.innerHTML =
            '<p class="error-message">Failed to load stories. Please try again later.</p>';
        }
      }
    };
  
    // Add event listener for dropdown selection
    categorySelector.addEventListener('change', (event) => {
      fetchAndCacheStories(event.target.value);
    });
  
    // Add event listeners for category tabs
    categoryTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        categoryTabs.forEach((tab) => tab.classList.remove('active'));
        tab.classList.add('active');
        fetchAndCacheStories(tab.dataset.category);
      });
    });
  
    // Initial fetch (default to dropdown value or first tab if present)
    if (categorySelector) {
      fetchAndCacheStories(categorySelector.value);
    } else if (categoryTabs.length > 0) {
      categoryTabs[0].classList.add('active');
      fetchAndCacheStories(categoryTabs[0].dataset.category);
    }
  });
  