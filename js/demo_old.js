// Demo Page JavaScript - Separate from main site to avoid conflicts

// Demo state management
let currentStep = 1;
let selectedStyle = null;
let selectedProduct = null;
let projectInfo = '';
let referenceImages = [];
let logoFile = null;
let currentPrompt = '';
let generatedImage = null;

// Step navigation functions
function nextStep(step) {
    if (step === 2 && !validateStep1()) {
        alert('Please fill in all required fields and select both a design style and product type');
        return;
    }
    
    // Hide current step
    document.getElementById(`step${currentStep}`).classList.remove('active');
    
    // Show next step
    document.getElementById(`step${step}`).classList.add('active');
    
    // Update progress bar
    updateProgressBar(step);
    
    currentStep = step;
    
    // Update model display when moving to step 2
    if (step === 2) {
        setTimeout(() => {
            updateModelDisplay();
            
            console.log('Moving to step 2, checking product...');
            console.log('selectedProduct value:', selectedProduct);
            console.log('selectedProduct type:', typeof selectedProduct);
            
            // If product is book, setup the book workflow
            if (selectedProduct && (selectedProduct === 'book' || selectedProduct.startsWith('books-'))) {
                console.log('Book product detected, setting up workflow...');
                setupBookWorkflow();
            } else {
                console.log('Not a book product, skipping workflow');
                console.log('Product check failed. selectedProduct:', selectedProduct);
            }
        }, 100); // Small delay to ensure DOM is ready
    }
    
    // Show step 3 only for books
    if (step === 3) {
        if (selectedProduct === 'book') {
            setTimeout(() => {
                // Show step 3 for books
                const step3Element = document.getElementById('step3');
                if (step3Element) {
                    step3Element.classList.add('active');
                    // Update progress bar to show 3/3
                    updateProgressBar(3);
                    
                    // Force initialization with longer delay
                    setTimeout(() => {
                        console.log('Forcing book design initialization...');
                        initializeBookDesign();
                        
                        // Double-check if page blocks were created
                        setTimeout(() => {
                            const pageBlocksScroll = document.getElementById('pageBlocksScroll');
                            if (pageBlocksScroll && pageBlocksScroll.children.length === 0) {
                                console.log('Page blocks still empty, forcing update...');
                                updateBookPages();
                            }
                        }, 300);
                    }, 300);
                }
            }, 100);
        } else {
            // For non-book products, finish the demo directly
            finishDemo();
            return;
        }
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function prevStep(step) {
    // Hide current step
    document.getElementById(`step${currentStep}`).classList.remove('active');
    
    // Show previous step
    document.getElementById(`step${step}`).classList.add('active');
    
    // Update progress bar
    updateProgressBar(step);
    
    currentStep = step;
    
    // Update model display when going back to step 2
    if (step === 2) {
        setTimeout(() => updateModelDisplay(), 100); // Small delay to ensure DOM is ready
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}



// Progress bar function
function updateProgressBar(activeStep) {
    const progressFill1 = document.getElementById('progressFill1');
    const progressFill2 = document.getElementById('progressFill2');
    const progressFill3 = document.getElementById('progressFill3');
    
    console.log('updateProgressBar called with step:', activeStep);
    console.log('progressFill1 element found:', !!progressFill1);
    console.log('progressFill2 element found:', !!progressFill2);
    console.log('progressFill3 element found:', !!progressFill3);
    
    // Calculate percentage based on current step and total steps
    const totalSteps = 3; // We have 3 steps
    const percentage = (activeStep / totalSteps) * 100;
    console.log('Setting progress to:', percentage + '%');
    
    // Update all progress bars if they exist
    if (progressFill1) {
        progressFill1.style.width = percentage + '%';
    }
    
    if (progressFill2) {
        progressFill2.style.width = percentage + '%';
    }
    
    if (progressFill3) {
        progressFill3.style.width = percentage + '%';
    }
    
    // Log progress bar updates
    if (progressFill1 || progressFill2 || progressFill3) {
        console.log('Progress bars updated to:', percentage + '%');
    } else {
        console.log('No progress bar elements found!');
    }
}

// Temporary test function
function testProgressBar() {
    console.log('Test button clicked');
    updateProgressBar(2);
}

// Validation functions
function validateStep1() {
    const projectInfoInput = document.getElementById('projectInfo');
    
    if (!projectInfoInput.value.trim()) {
        return false;
    }
    
    if (!selectedStyle || !selectedProduct) {
        return false;
    }
    
    // Save values
    projectInfo = projectInfoInput.value.trim();
    
    return true;
}

// Function to update Next button state based on validation
function updateNextButtonState() {
    const nextBtn = document.getElementById('step1NextBtn');
    const stepHint = document.getElementById('step1Hint');
    
    if (!nextBtn || !stepHint) return;
    
    const isValid = validateStep1();
    
    if (isValid) {
        nextBtn.disabled = false;
        stepHint.textContent = 'Ready to proceed to the next step!';
        stepHint.style.color = 'var(--success-color, #10b981)';
    } else {
        nextBtn.disabled = true;
        stepHint.textContent = 'Please fill in project details and select a style and product to continue';
        stepHint.style.color = 'var(--text-light)';
    }
}

// Style and product selection
function selectStyle(style) {
    selectedStyle = style;
    
    // Remove selected class from all style blocks
    document.querySelectorAll('.style-block').forEach(block => {
        block.classList.remove('selected');
    });
    
    // Add selected class to clicked block
    event.target.closest('.style-block').classList.add('selected');
    
    // Update Next button state
    updateNextButtonState();
}

function selectArtist(artist) {
    selectedStyle = 'artist-' + artist;
    
    // Remove selected class from all artist blocks
    document.querySelectorAll('.artist-block').forEach(block => {
        block.classList.remove('selected');
    });
    
    // Add selected class to clicked block
    event.target.closest('.artist-block').classList.add('selected');
    
    // Update Next button state
    updateNextButtonState();
}

function selectProduct(product) {
    selectedProduct = product;
    
    // Remove selected class from all product blocks
    document.querySelectorAll('.product-block').forEach(block => {
        block.classList.remove('selected');
    });
    
    // Add selected class to clicked block
    event.target.closest('.product-block').classList.add('selected');
}

// Section navigation
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.option-section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    document.getElementById(sectionId).style.display = 'block';
    
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Clear previous selections when switching sections
    if (sectionId === 'stylesSection') {
        selectedStyle = null;
        document.querySelectorAll('.style-block').forEach(block => {
            block.classList.remove('selected');
        });
        // Reset to first grid
        showStyleGrid(1);
    } else if (sectionId === 'artistsSection') {
        selectedStyle = null;
        document.querySelectorAll('.artist-block').forEach(block => {
            block.classList.remove('selected');
        });
        // Reset to first grid
        showArtistGrid(1);
    } else if (sectionId === 'customSection') {
        selectedStyle = 'custom';
        document.querySelectorAll('.style-block, .artist-block').forEach(block => {
            block.classList.remove('selected');
        });
    }
    
    // Update Next button state after clearing selections
    updateNextButtonState();
}



// Category toggle functionality
function toggleCategory(category) {
    console.log('toggleCategory called with:', category);
    
    // Hide main category view
    const mainCategoryView = document.getElementById('mainCategoryView');
    
    // Hide all sub-option views
    document.querySelectorAll('.sub-options-view').forEach(view => {
        view.style.display = 'none';
    });
    
    // Remove selected class from all main category blocks
    document.querySelectorAll('.main-category-block').forEach(block => {
        block.classList.remove('selected');
    });
    
    // Add selected class to clicked block
    const clickedBlock = event.target.closest('.main-category-block');
    if (clickedBlock) {
        clickedBlock.classList.add('selected');
    }
    
    // Show appropriate sub-options view
    if (category === 'books') {
        const booksView = document.getElementById('booksView');
        if (booksView) {
            mainCategoryView.style.display = 'none';
            booksView.style.display = 'flex';
            console.log('Showing books view');
        } else {
            console.log('Books view element not found');
        }
    }
    
    if (category === 'packaging') {
        const packagingView = document.getElementById('packagingView');
        if (packagingView) {
            mainCategoryView.style.display = 'none';
            packagingView.style.display = 'flex';
            console.log('Showing packaging view');
        } else {
            console.log('Packaging view element not found');
        }
    }
    
    // Update selected product
    selectedProduct = category;
    
    // Update Next button state
    updateNextButtonState();
}

// Product selection from sub-options
function selectProduct(productType) {
    console.log('selectProduct called with:', productType);
    
    // Update selected product with specific type
    if (productType.startsWith('can') || productType.startsWith('squareBox') || 
        productType.startsWith('rectangularBox') || productType.startsWith('tubeBox')) {
        selectedProduct = `packaging-${productType}`;
    } else if (productType.startsWith('childrenBooks') || productType.startsWith('notebook')) {
        selectedProduct = `books-${productType}`;
    } else {
        selectedProduct = productType;
    }
    
    // Add visual feedback - highlight the selected sub-option
    document.querySelectorAll('.sub-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Find the clicked sub-option and add selected class
    const clickedOption = event.target.closest('.sub-option');
    if (clickedOption) {
        clickedOption.classList.add('selected');
    }
    
    console.log('Selected product:', selectedProduct);
    
    // Update Next button state
    updateNextButtonState();
}

// Debug function to test if elements exist
function debugElements() {
    console.log('Debug: Checking if elements exist...');
    console.log('Books options:', document.getElementById('booksSubOptions'));
    console.log('Packaging options:', document.getElementById('packagingSubOptions'));
    console.log('All sub-options:', document.querySelectorAll('.sub-options-expanded'));
    console.log('All sub-option images:', document.querySelectorAll('.sub-option img'));
}

// Back to main categories function
function backToMainCategories() {
    // Show main category view
    const mainCategoryView = document.getElementById('mainCategoryView');
    mainCategoryView.style.display = 'grid';
    
    // Hide all sub-option views
    document.querySelectorAll('.sub-options-view').forEach(view => {
        view.style.display = 'none';
    });
    
    // Remove selected class from all main category blocks
    document.querySelectorAll('.main-category-block').forEach(block => {
        block.classList.remove('selected');
    });
    
    // Reset selected product
    selectedProduct = '';
    
    // Update Next button state
    updateNextButtonState();
}

// Logo upload functionality
function handleLogoUpload(files) {
    if (files && files.length > 0) {
        const file = files[0];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }
        
        logoFile = file;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            const logoPreview = document.getElementById('logoPreview');
            const logoPreviewImg = document.getElementById('logoPreviewImg');
            const logoUploadZone = document.getElementById('logoUploadZone');
            
            logoPreviewImg.src = e.target.result;
            logoPreview.style.display = 'block';
            logoUploadZone.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// Reference images upload functionality
function handleReferenceUpload(files) {
    if (files && files.length > 0) {
        const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        // Validate file sizes (5MB each)
        const validFiles = newFiles.filter(file => file.size <= 5 * 1024 * 1024);
        
        if (validFiles.length !== newFiles.length) {
            alert('Some files were too large. Maximum file size is 5MB per image.');
        }
        
        referenceImages = [...referenceImages, ...validFiles];
        updateReferencePreview();
    }
}

function updateReferencePreview() {
    const preview = document.getElementById('referencePreview');
    preview.innerHTML = '';
    
    referenceImages.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgContainer = document.createElement('div');
            imgContainer.style.cssText = 'position: relative; display: inline-block; margin-right: 8px; margin-bottom: 8px;';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.cssText = 'width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #e0e0e0;';
            
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '×';
            removeBtn.style.cssText = 'position: absolute; top: -5px; right: -5px; background: #ff5f56; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 14px; cursor: pointer; line-height: 1;';
            removeBtn.onclick = function() {
                referenceImages.splice(index, 1);
                updateReferencePreview();
            };
            
            imgContainer.appendChild(img);
            imgContainer.appendChild(removeBtn);
            preview.appendChild(imgContainer);
        };
        reader.readAsDataURL(file);
    });
    
    if (referenceImages.length > 0) {
        preview.style.display = 'block';
        document.getElementById('referenceUploadZone').style.display = 'none';
    } else {
        preview.style.display = 'none';
        document.getElementById('referenceUploadZone').style.display = 'block';
    }
}

// Custom style upload functionality
let customImages = [];

function handleCustomUpload(files) {
    if (files && files.length > 0) {
        const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        if (customImages.length + newFiles.length > 10) {
            alert('You can only upload a maximum of 10 images');
            return;
        }
        
        customImages = [...customImages, ...newFiles];
        updateCustomPreview();
        
        if (customImages.length >= 10) {
            document.getElementById('readyToDesignBtn').style.display = 'block';
        }
    }
}

function updateCustomPreview() {
    const preview = document.getElementById('customPreview');
    preview.innerHTML = '';
    
    customImages.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = `Custom style ${index + 1}`;
            img.onclick = () => removeCustomImage(index);
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

function removeCustomImage(index) {
    customImages.splice(index, 1);
    updateCustomPreview();
    
    if (customImages.length < 10) {
        document.getElementById('readyToDesignBtn').style.display = 'none';
    }
}

function readyToDesign() {
    if (customImages.length >= 10) {
        selectedStyle = 'custom';
        alert('Custom style model ready! You can now proceed to the next step.');
        
        // Update Next button state
        updateNextButtonState();
    } else {
        alert('Please upload at least 10 images to create your custom style model.');
    }
}

function removeLogo() {
    logoFile = null;
    const logoPreview = document.getElementById('logoPreview');
    const logoUploadZone = document.getElementById('logoUploadZone');
    
    logoPreview.style.display = 'none';
    logoUploadZone.style.display = 'block';
}

// Generate art based on prompt and selected style
function generateArt() {
    const promptInput = document.getElementById('promptInput');
    const generateBtn = document.getElementById('generateBtn');
    const btnText = generateBtn.querySelector('.btn-text');
    const spinner = generateBtn.querySelector('.spinner');
    
    if (!promptInput.value.trim()) {
        alert('Please enter a description of what you want to generate');
        return;
    }
    
    currentPrompt = promptInput.value.trim();
    
    // Show loading state
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';
    generateBtn.disabled = true;
    
    // Simulate AI generation (replace with actual API call)
    setTimeout(() => {
        simulateArtGeneration();
    }, 2000);
}

// Simulate art generation (replace with actual API integration)
function simulateArtGeneration() {
    const generateBtn = document.getElementById('generateBtn');
    const btnText = generateBtn.querySelector('.btn-text');
    const spinner = generateBtn.querySelector('.spinner');
    
    // Get a sample image based on the selected style
    const sampleImages = {
        watercolor: 'images/Styles/Watercolor/Generated/Bird.jpeg',
        folk: 'images/Styles/Folk/Generated/1.jpeg',
        botanical: 'images/Styles/Botanical/Generated/exactly.ai_BotanicalHarmony_ACascadingStalkOfUnopenedAmaltasBuds—Elegant_2025-05-13_14-56.jpeg'
    };
    
    const sampleImage = sampleImages[currentStyle];
    
    if (sampleImage) {
        displayResult(sampleImage);
    } else {
        // Fallback to a placeholder
        displayResult('images/Styles/Watercolor/Generated/Bird.jpeg');
    }
    
    // Reset button state
    btnText.style.display = 'inline';
    spinner.style.display = 'none';
    generateBtn.disabled = false;
}

// Display the generated result
function displayResult(imageSrc) {
    const resultImage = document.getElementById('resultImage');
    const resultActions = document.getElementById('resultActions');
    
    // Clear placeholder
    resultImage.innerHTML = '';
    
    // Create and display the image
    const img = document.createElement('img');
    img.src = imageSrc;
    img.alt = 'Generated artwork';
    img.onerror = function() {
        // Fallback if image fails to load
        resultImage.innerHTML = `
            <div class="placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
                </svg>
                <p>Generated artwork</p>
            </div>
        `;
    };
    
    resultImage.appendChild(img);
    generatedImage = imageSrc;
    
    // Show action buttons
    resultActions.style.display = 'flex';
    
    // Track generation event
    if (typeof gtag !== 'undefined') {
        gtag('event', 'art_generation', {
            'event_category': 'demo',
            'event_label': currentStyle,
            'prompt': currentPrompt
        });
    }
}

// Clear the result display
function clearResult() {
    const resultImage = document.getElementById('resultImage');
    const resultActions = document.getElementById('resultActions');
    
    resultImage.innerHTML = `
        <div class="placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>
            </svg>
            <p>Your generated artwork will appear here</p>
        </div>
    `;
    
    resultActions.style.display = 'none';
    generatedImage = null;
}

// Download the generated artwork
function downloadArt() {
    if (!generatedImage) {
        alert('No artwork to download');
        return;
    }
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `museai-${currentStyle}-${Date.now()}.jpg`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Track download event
    if (typeof gtag !== 'undefined') {
        gtag('event', 'art_download', {
            'event_category': 'demo',
            'event_label': currentStyle
        });
    }
}

// Generate a variation of the current artwork
function generateVariation() {
    if (!currentPrompt) {
        alert('Please generate an artwork first');
        return;
    }
    
    // Add variation to the prompt
    const variationPrompt = currentPrompt + ' (variation)';
    
    // Simulate variation generation
    const generateBtn = document.getElementById('generateBtn');
    const btnText = generateBtn.querySelector('.btn-text');
    const spinner = generateBtn.querySelector('.spinner');
    
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';
    generateBtn.disabled = true;
    
    setTimeout(() => {
        // Get a different sample image for variation
        const sampleImages = {
            watercolor: 'images/Styles/Watercolor/Generated/Car.jpeg',
            folk: 'images/Styles/Folk/Generated/2.jpeg',
            botanical: 'images/Styles/Botanical/Generated/exactly.ai_BotanicalHarmony_ASingleGulmoharFlowerBud—CurvedNarrowWithA_2025-05-13_14-56.jpeg'
        };
        
        const variationImage = sampleImages[currentStyle];
        if (variationImage) {
            displayResult(variationImage);
        }
        
        btnText.style.display = 'inline';
        spinner.style.display = 'none';
        generateBtn.disabled = false;
    }, 1500);
    
    // Track variation event
    if (typeof gtag !== 'undefined') {
        gtag('event', 'art_variation', {
            'event_category': 'demo',
            'event_label': currentStyle
        });
    }
}

// Finish demo function
function finishDemo() {
    let summary = `
Brand: ${brandName}
Style: ${selectedStyle}
Product: ${selectedProduct}
Prompt: ${currentPrompt}`;
    
    // Add book-specific information if it's a book
    if (selectedProduct === 'book') {
        const numberOfPages = document.getElementById('numberOfPages')?.value || 'Not selected';
        summary += `\nNumber of Pages: ${numberOfPages}`;
    }
    
    alert('Demo completed! Here\'s your summary:\n' + summary);
    
    // Track completion
    if (typeof gtag !== 'undefined') {
        gtag('event', 'demo_completed', {
            'event_category': 'demo',
            'brand_name': brandName,
            'style': selectedStyle,
            'product': selectedProduct,
            'book_pages': selectedProduct === 'book' ? (document.getElementById('numberOfPages')?.value || 'Not selected') : 'N/A'
        });
    }
    
    // Redirect to waitlist
    window.open('https://tally.so/r/n9g6JG', '_blank');
}

// Handle Enter key in prompt input
document.addEventListener('DOMContentLoaded', function() {
    const promptInput = document.getElementById('promptInput');
    
    if (promptInput) {
        promptInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                generateArt();
            }
        });
    }
    
    // Initialize logo upload
    const logoUpload = document.getElementById('logoUpload');
    const logoUploadZone = document.getElementById('logoUploadZone');
    
    if (logoUpload && logoUploadZone) {
        logoUpload.addEventListener('change', function(e) {
            handleLogoUpload(e.target.files);
        });
        
        logoUploadZone.addEventListener('click', function() {
            logoUpload.click();
        });
        
        logoUploadZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            logoUploadZone.style.borderColor = 'var(--primary)';
            logoUploadZone.style.background = 'rgba(124, 58, 237, 0.05)';
        });
        
        logoUploadZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            logoUploadZone.style.borderColor = 'var(--border-color)';
            logoUploadZone.style.background = '#f8f9fa';
        });
        
        logoUploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            logoUploadZone.style.borderColor = 'var(--border-color)';
            logoUploadZone.style.background = '#f8f9fa';
            handleLogoUpload(e.dataTransfer.files);
        });
    }
    
    // Initialize custom upload
    const customUpload = document.getElementById('customUpload');
    const customUploadZone = document.getElementById('customUploadZone');
    
    if (customUpload && customUploadZone) {
        customUpload.addEventListener('change', function(e) {
            handleCustomUpload(e.target.files);
        });
        
        customUploadZone.addEventListener('click', function() {
            customUpload.click();
        });
        
        customUploadZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            customUploadZone.style.borderColor = 'var(--primary)';
            customUploadZone.style.background = 'rgba(124, 58, 237, 0.05)';
        });
        
        customUploadZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            customUploadZone.style.borderColor = 'var(--border-color)';
            customUploadZone.style.background = '#f8f9fa';
        });
        
        customUploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            customUploadZone.style.borderColor = 'var(--border-color)';
            customUploadZone.style.background = '#f8f9fa';
            handleCustomUpload(e.dataTransfer.files);
        });
    }
    
    // Initialize progress bar for step 1
    updateProgressBar(1);
    
    // Add event listener for project info textarea
    const projectInfoInput = document.getElementById('projectInfo');
    if (projectInfoInput) {
        projectInfoInput.addEventListener('input', updateNextButtonState);
    }
    
    // Initialize Next button state
    updateNextButtonState();
    
    // Update model display for step 2
    updateModelDisplay();
    
    console.log('Demo page initialized');
});

// Image Generation Variables
let generatedImages = [];
let selectedImages = [];
let currentGenerationId = 0;

// Example prompts for inspiration
const examplePrompts = [
    "A cat sitting in a garden with flowers",
    "A peaceful mountain landscape at sunset",
    "A cozy coffee shop interior",
    "A magical forest with glowing mushrooms",
    "A vintage car on a country road",
    "A beautiful butterfly on a flower",
    "A cozy reading nook with books",
    "A serene lake with mountains in the background"
];

// Function to suggest random prompts (can be used for inspiration)
function suggestPrompt() {
    const randomPrompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    const promptInput = document.getElementById('promptInput');
    if (promptInput) {
        promptInput.value = randomPrompt;
        promptInput.focus();
    }
}

// Function to update the selected model display
function updateModelDisplay() {
    console.log('updateModelDisplay called');
    console.log('selectedStyle:', selectedStyle);
    console.log('selectedProduct:', selectedProduct);
    
    const modelStyle = document.getElementById('modelStyle');
    const modelProduct = document.getElementById('modelProduct');
    const modelStyleImage = document.getElementById('modelStyleImage');
    const modelProductImage = document.getElementById('modelProductImage');
    
    console.log('DOM elements found:', {
        modelStyle: !!modelStyle,
        modelProduct: !!modelProduct,
        modelStyleImage: !!modelStyleImage,
        modelProductImage: !!modelProductImage
    });
    
    if (modelStyle && modelProduct && modelStyleImage && modelProductImage) {
        // Update Design Model (Style)
        if (selectedStyle) {
            let styleDisplay = selectedStyle;
            let styleImageSrc = '';
            
            if (selectedStyle.startsWith('artist-')) {
                const artistName = selectedStyle.replace('artist-', '');
                styleDisplay = artistName.charAt(0).toUpperCase() + artistName.slice(1);
                styleImageSrc = `images/Demo/Artists/${artistName.charAt(0).toUpperCase() + artistName.slice(1)}.jpg`;
            } else {
                styleDisplay = selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1);
                styleImageSrc = `images/Demo/Styles/${selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1)}.jpg`;
            }
            
            console.log('Setting style display:', styleDisplay, 'with image:', styleImageSrc);
            modelStyle.textContent = styleDisplay;
            modelStyleImage.src = styleImageSrc;
            modelStyleImage.style.display = 'block';
        } else {
            console.log('No style selected, showing "Not selected"');
            modelStyle.textContent = 'Not selected';
            modelStyleImage.style.display = 'none';
        }
        
        // Update Product
        if (selectedProduct) {
            let productDisplay = selectedProduct;
            let productImageSrc = '';
            
            // Remove prefixes for display
            if (productDisplay.startsWith('packaging-')) {
                productDisplay = productDisplay.replace('packaging-', '');
            } else if (productDisplay.startsWith('books-')) {
                productDisplay = productDisplay.replace('books-', '');
            }
            
            // Capitalize first letter and format product names
            productDisplay = productDisplay.charAt(0).toUpperCase() + productDisplay.slice(1);
            productDisplay = productDisplay.replace(/([A-Z])/g, ' $1').trim();
            
            // Set product image based on selection (handle prefixed values)
            if (selectedProduct === 'childrenBooks' || selectedProduct === 'books-childrenBooks') {
                productImageSrc = 'images/Demo/Kind of Product/Book/StoryBookChildren.jpg';
            } else if (selectedProduct === 'notebook' || selectedProduct === 'books-notebook') {
                productImageSrc = 'images/Demo/Kind of Product/Book/Notebook.jpg';
            } else if (selectedProduct === 'can' || selectedProduct === 'packaging-can') {
                productImageSrc = 'images/Demo/Kind of Product/Product Packaging/CanMockup.jpg';
            } else if (selectedProduct === 'squareBox' || selectedProduct === 'packaging-squareBox') {
                productImageSrc = 'images/Demo/Kind of Product/Product Packaging/BoxMockup.jpg';
            } else if (selectedProduct === 'rectangularBox' || selectedProduct === 'packaging-rectangularBox') {
                productImageSrc = 'images/Demo/Kind of Product/Product Packaging/RectangularBox.jpg';
            } else if (selectedProduct === 'tubeBox' || selectedProduct === 'packaging-tubeBox') {
                productImageSrc = 'images/Demo/Kind of Product/Product Packaging/TubeBox.jpg';
            } else {
                // Default product image
                productImageSrc = 'images/Demo/Kind of Product/Product package.jpg';
            }
            
            console.log('Setting product display:', productDisplay, 'with image:', productImageSrc);
            console.log('Original selectedProduct:', selectedProduct);
            console.log('Processed productDisplay:', productDisplay);
            modelProduct.textContent = productDisplay;
            modelProductImage.src = productImageSrc;
            modelProductImage.style.display = 'block';
        } else {
            console.log('No product selected, showing "Not selected"');
            modelProduct.textContent = 'Not selected';
            modelProductImage.style.display = 'none';
        }
    } else {
        console.log('Some DOM elements not found');
    }
}

// Function to update the summary display
function updateSummary() {
    console.log('updateSummary called');
    
    const summaryStyle = document.getElementById('summaryStyle');
    const summaryProduct = document.getElementById('summaryProduct');
    const summaryDescription = document.getElementById('summaryDescription');
    const summaryGenerations = document.getElementById('summaryGenerations');
    const summarySelected = document.getElementById('summarySelected');
    
    if (summaryStyle && summaryProduct && summaryDescription && summaryGenerations && summarySelected) {
        // Update style summary
        if (selectedStyle) {
            let styleDisplay = selectedStyle;
            if (selectedStyle.startsWith('artist-')) {
                const artistName = selectedStyle.replace('artist-', '');
                styleDisplay = artistName.charAt(0).toUpperCase() + artistName.slice(1);
            } else {
                styleDisplay = selectedStyle.charAt(0).toUpperCase() + selectedStyle.slice(1);
            }
            summaryStyle.textContent = styleDisplay;
        } else {
            summaryStyle.textContent = 'Not selected';
        }
        
        // Update product summary
        if (selectedProduct) {
            let productDisplay = selectedProduct;
            if (productDisplay.startsWith('packaging-')) {
                productDisplay = productDisplay.replace('packaging-', '');
            } else if (productDisplay.startsWith('books-')) {
                productDisplay = productDisplay.replace('books-', '');
            }
            productDisplay = productDisplay.charAt(0).toUpperCase() + productDisplay.slice(1);
            productDisplay = productDisplay.replace(/([A-Z])/g, ' $1').trim();
            summaryProduct.textContent = productDisplay;
        } else {
            summaryProduct.textContent = 'Not selected';
        }
        
        // Update project description
        summaryDescription.textContent = projectInfo || 'Not provided';
        
        // Update generation counts
        summaryGenerations.textContent = generatedImages.length;
        summarySelected.textContent = selectedImages.length;
        
        console.log('Summary updated successfully');
    } else {
        console.log('Some summary elements not found');
    }
}

// Function to add reference image
function addReferenceImage() {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            // Handle reference image upload
            console.log('Reference image added:', file.name);
            // You can implement actual upload logic here
        }
    };
    input.click();
}

// Function to generate images
function generateImages() {
    const promptInput = document.getElementById('promptInput');
    const prompt = promptInput.value.trim();
    
    // For book products, allow generation even with empty prompt (since we prefill it)
    if (!prompt && (!selectedProduct || !(selectedProduct === 'book' || selectedProduct.startsWith('books-')))) {
        alert('Please enter a prompt to generate images');
        return;
    }
    
    if (!selectedStyle || !selectedProduct) {
        alert('Please select both a design style and product type from the previous step');
        return;
    }
    
    // Show loading state
    const generateBtn = document.getElementById('generateBtn');
    const btnText = generateBtn.querySelector('.btn-text');
    const spinner = generateBtn.querySelector('.spinner');
    
    btnText.style.display = 'none';
    spinner.style.display = 'inline-block';
    generateBtn.disabled = true;
    
    // Simulate image generation (replace with actual API call)
    setTimeout(() => {
        // For book products, use default prompt if empty
        let finalPrompt = prompt;
        if (!prompt && selectedProduct && (selectedProduct === 'book' || selectedProduct.startsWith('books-'))) {
            finalPrompt = 'Book cover illustration prompt';
        }
        
        // Create mock generated images
        const newImages = createMockImages(finalPrompt);
        
        // Add to generated images array
        generatedImages.push({
            id: currentGenerationId++,
            prompt: finalPrompt,
            images: newImages,
            timestamp: new Date()
        });
        
        // Reset button state
        btnText.style.display = 'inline-block';
        spinner.style.display = 'none';
        generateBtn.disabled = false;
        
        // Clear prompt input
        promptInput.value = '';
        
        // Handle book products differently
        if (selectedProduct && (selectedProduct === 'book' || selectedProduct.startsWith('books-'))) {
            console.log('Book product detected, showing book images...');
            
            // Check how many generations already exist
            const existingGenerations = document.querySelectorAll('.generation-row');
            console.log('Existing generations count:', existingGenerations.length);
            
            if (existingGenerations.length === 0) {
                // No generations exist yet, populate the first one
                populateBookImages();
            } else if (existingGenerations.length === 1) {
                // First generation exists, add the second one
                addSecondBookGeneration();
            } else if (existingGenerations.length === 2) {
                // Second generation exists, add the third one
                addThirdBookGeneration();
            } else if (existingGenerations.length === 3) {
                // Third generation exists, add the fourth one
                addFourthBookGeneration();
            } else if (existingGenerations.length === 4) {
                // Fourth generation exists, add the fifth one
                addFifthBookGeneration();
            } else if (existingGenerations.length === 5) {
                // Fifth generation exists, add the sixth one
                addSixthBookGeneration();
            } else {
                // All generations exist, just show a message
                console.log('All 6 generations have been created');
            }
        } else {
            // For non-book products, use the normal display
            displayGeneratedImages();
        }
        
    }, 2000); // Simulate 2 second generation time
}

// Function to create mock images (replace with actual API call)
function createMockImages(prompt) {
    const mockImages = [];
    for (let i = 0; i < 4; i++) {
        mockImages.push({
            id: `img_${Date.now()}_${i}`,
            url: `https://picsum.photos/400/400?random=${Date.now() + i}`, // Placeholder images
            alt: `${prompt} - Variation ${i + 1}`
        });
    }
    return mockImages;
}

// Function to display generated images
function displayGeneratedImages() {
    const container = document.getElementById('generatedImagesContainer');
    
    if (generatedImages.length === 0) {
        container.innerHTML = `
            <div class="placeholder-message">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l4.5 6H5l3.5-4.5z" fill="currentColor"/>
                </svg>
                <p>Your generated images will appear here</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    // Display each generation as a new row in reverse chronological order
    generatedImages.slice().reverse().forEach((generation, index) => {
        const actualIndex = generatedImages.length - index; // Calculate actual generation number
        html += `
            <div class="generation-result">
                <div class="generation-header">
                    <span class="generation-number">Generation ${actualIndex}</span>
                    <div class="prompt-text">"${generation.prompt}"</div>
                </div>
                <div class="images-grid">
        `;
        
        // Display 4 images in a row
        generation.images.forEach(image => {
            const isSelected = selectedImages.some(selected => selected.id === image.id);
            html += `
                <div class="generated-image-item ${isSelected ? 'selected' : ''}" 
                     onclick="toggleImageSelection('${image.id}', '${generation.id}')">
                    <img src="${image.url}" alt="${image.alt}">
                    <div class="image-overlay">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                        </svg>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Function to toggle image selection
function toggleImageSelection(imageId, generationId) {
    const generation = generatedImages.find(g => g.id == generationId);
    const image = generation.images.find(img => img.id === imageId);
    
    if (!image) return;
    
    const isSelected = selectedImages.some(selected => selected.id === imageId);
    
    if (isSelected) {
        // Remove from selected images
        selectedImages = selectedImages.filter(selected => selected.id !== imageId);
    } else {
        // Add to selected images
        selectedImages.push({
            ...image,
            generationId: generationId,
            prompt: generation.prompt
        });
    }
    
    // Update displays
    displayGeneratedImages();
    displaySelectedImages();
}

// Function to display selected images
function displaySelectedImages() {
    const container = document.getElementById('selectedImagesContainer');
    
    if (selectedImages.length === 0) {
        container.innerHTML = `
            <div class="placeholder-message">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                </svg>
                <p>Selected images will appear here</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    // Group images into rows of 8
    for (let i = 0; i < selectedImages.length; i += 8) {
        const rowImages = selectedImages.slice(i, i + 8);
        
        // Create a row container
        html += '<div class="selected-images-row">';
        
        // Add images to the row
        rowImages.forEach(image => {
            html += `
                <div class="selected-image-item">
                    <img src="${image.url}" alt="${image.alt}">
                    <button class="remove-btn" onclick="removeSelectedImage('${image.id}')">×</button>
                </div>
            `;
        });
        
        // Fill remaining slots in the row with empty placeholders to maintain grid
        const remainingSlots = 8 - rowImages.length;
        for (let j = 0; j < remainingSlots; j++) {
            html += '<div class="selected-image-item empty-slot"></div>';
        }
        
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// Function to remove selected image
function removeSelectedImage(imageId) {
    selectedImages = selectedImages.filter(selected => selected.id !== imageId);
    
    // Update displays
    displayGeneratedImages();
    displaySelectedImages();
}

// Mobile menu functionality
function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    const toggle = document.querySelector('.mobile-menu-toggle');
    nav.classList.toggle('active');
    toggle.classList.toggle('active');
}

function closeMobileMenu() {
    const nav = document.querySelector('.nav');
    const toggle = document.querySelector('.mobile-menu-toggle');
    nav.classList.remove('active');
    toggle.classList.remove('active');
}

// Book Design Functions
function initializeBookDesign() {
    console.log('Initializing book design');
    
    // Small delay to ensure DOM is fully ready
    setTimeout(() => {
        // Set default to 4 pages and immediately display page blocks
        const numberOfPagesSelect = document.getElementById('numberOfPages');
        if (numberOfPagesSelect) {
            numberOfPagesSelect.value = '4';
            console.log('Set numberOfPages to 4');
        } else {
            console.log('numberOfPagesSelect not found');
        }
        
        // Force update the page blocks
        updateBookPages();
    }, 200);
}

function updateBookPages() {
    console.log('updateBookPages called');
    
    const numberOfPages = parseInt(document.getElementById('numberOfPages').value) || 0;
    const pageBlocksScroll = document.getElementById('pageBlocksScroll');
    
    console.log('numberOfPages:', numberOfPages);
    console.log('pageBlocksScroll element found:', !!pageBlocksScroll);
    
    if (!pageBlocksScroll) {
        console.log('pageBlocksScroll not found, returning early');
        return;
    }
    
    let html = '';
    
    // Always add Front Cover
    html += createPageBlock('Front Cover', 0);
    
    // Add content pages based on selection (if any)
    if (numberOfPages > 0) {
        for (let i = 1; i <= numberOfPages; i++) {
            html += createPageBlock(`Page ${i}`, i);
        }
    }
    
    // Always add Back Cover
    html += createPageBlock('Back Cover', numberOfPages + 1);
    
    console.log('Generated HTML length:', html.length);
    console.log('Setting innerHTML on pageBlocksScroll');
    
    pageBlocksScroll.innerHTML = html;
    populateImageDropdowns();
    
    // Reset scroll position and update arrow states
    pageBlocksScroll.style.transform = 'translateX(0px)';
    updateArrowStates();
    
    console.log('updateBookPages completed');
}

function createPageBlock(title, pageIndex) {
    const imageOptions = getImageOptions(pageIndex);
    return `
        <div class="page-block" data-page="${pageIndex}">
            <h4>${title}</h4>
            <div class="page-image-placeholder" id="pageImage${pageIndex}">
                <span>Image ${pageIndex + 1}</span>
            </div>
            <div class="custom-image-dropdown" id="customDropdown${pageIndex}">
                <button class="dropdown-toggle" onclick="toggleImageDropdown(${pageIndex})">
                    <span class="dropdown-text">Select an image</span>
                    <span class="dropdown-arrow">▼</span>
                </button>
                <div class="dropdown-menu" id="dropdownMenu${pageIndex}">
                    <div class="dropdown-option" data-value="" onclick="selectImageOption(${pageIndex}, '', 'Select an image')">
                        <span>Select an image</span>
                    </div>
                    ${imageOptions}
                </div>
            </div>
            <textarea class="page-text-input" id="pageText${pageIndex}" placeholder="Enter text for ${title.toLowerCase()}..."></textarea>
        </div>
    `;
}

function getImageOptions(pageIndex) {
    // Get selected images from step 2 using the correct selector
    const selectedImages = document.querySelectorAll('.selected-image-item img');
    console.log('Found selected images:', selectedImages.length);
    
    let options = '';
    
    if (selectedImages.length > 0) {
        console.log('Selected images:', selectedImages);
        selectedImages.forEach((img, index) => {
            const src = img.src;
            if (src) {
                options += `<div class="dropdown-option" data-value="${src}" onclick="selectImageOption(${pageIndex}, '${src}', 'Selected Image ${index + 1}')">
                    <img src="${src}" alt="Selected Image ${index + 1}" class="option-thumbnail">
                    <span>Selected Image ${index + 1}</span>
                </div>`;
            }
        });
    } else {
        options = '<div class="dropdown-option" data-value="">No images available</div>';
    }
    
    console.log('Generated options:', options);
    return options;
}

function populateImageDropdowns() {
    // Update all page block dropdowns with current image options
    const selectedImages = document.querySelectorAll('.selected-image-item img');
    console.log('Found selected images in populateImageDropdowns:', selectedImages.length);
    
    const pageBlocks = document.querySelectorAll('.page-block');
    pageBlocks.forEach((block, index) => {
        const selectElement = block.querySelector('.page-select-image');
        if (selectElement) {
            const imageOptions = getImageOptions();
            selectElement.innerHTML = '<option value="">Select an image</option>' + imageOptions;
        }
    });
}

function updatePageImage(pageIndex, imageSrc) {
    if (!imageSrc) return;
    
    const pageImagePlaceholder = document.getElementById(`pageImage${pageIndex}`);
    if (pageImagePlaceholder) {
        pageImagePlaceholder.innerHTML = `<img src="${imageSrc}" alt="Page ${pageIndex + 1}">`;
        
        // Get the newly added image and ensure it fits within the container
        const img = pageImagePlaceholder.querySelector('img');
        if (img) {
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '6px';
        }
    }
}

// Custom Dropdown Functions
function toggleImageDropdown(pageIndex) {
    const dropdownMenu = document.getElementById(`dropdownMenu${pageIndex}`);
    const allDropdowns = document.querySelectorAll('.dropdown-menu');
    
    // Close all other dropdowns
    allDropdowns.forEach(dropdown => {
        if (dropdown !== dropdownMenu) {
            dropdown.classList.remove('active');
        }
    });
    
    // Toggle current dropdown
    dropdownMenu.classList.toggle('active');
}

function selectImageOption(pageIndex, imageSrc, imageText) {
    // Update the dropdown button text
    const dropdownToggle = document.querySelector(`#customDropdown${pageIndex} .dropdown-text`);
    if (dropdownToggle) {
        dropdownToggle.textContent = imageText;
    }
    
    // Close the dropdown
    const dropdownMenu = document.getElementById(`dropdownMenu${pageIndex}`);
    if (dropdownMenu) {
        dropdownMenu.classList.remove('active');
    }
    
    // Update the page image if an image was selected
    if (imageSrc) {
        updatePageImage(pageIndex, imageSrc);
    }
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.custom-image-dropdown')) {
        const allDropdowns = document.querySelectorAll('.dropdown-menu');
        allDropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }
});

// Navigation Functions
function scrollPages(direction) {
    const pageBlocksScroll = document.getElementById('pageBlocksScroll');
    if (!pageBlocksScroll) return;
    
    const blockWidth = 220; // Width of each page block
    const gap = 24; // Gap between blocks (1.5rem)
    const scrollAmount = blockWidth + gap;
    
    let currentTransform = pageBlocksScroll.style.transform;
    let currentX = 0;
    
    if (currentTransform && currentTransform !== 'none') {
        currentX = parseInt(currentTransform.replace('translateX(', '').replace('px)', ''));
    }
    
    if (direction === 'left') {
        currentX += scrollAmount;
    } else {
        currentX -= scrollAmount;
    }
    
    pageBlocksScroll.style.transform = `translateX(${currentX}px)`;
    updateArrowStates();
}

function updateArrowStates() {
    const pageBlocksScroll = document.getElementById('pageBlocksScroll');
    const leftArrow = document.getElementById('leftArrow');
    const rightArrow = document.getElementById('rightArrow');
    
    if (!pageBlocksScroll || !leftArrow || !rightArrow) return;
    
    const currentTransform = pageBlocksScroll.style.transform;
    let currentX = 0;
    
    if (currentTransform && currentTransform !== 'none') {
        currentX = parseInt(currentTransform.replace('translateX(', '').replace('px)', ''));
    }
    
    // Enable/disable left arrow
    leftArrow.disabled = currentX >= 0;
    
    // Calculate total width and visible width
    const totalBlocks = pageBlocksScroll.children.length;
    const visibleBlocks = 4;
    const totalWidth = totalBlocks * 220 + (totalBlocks - 1) * 24; // block width + gaps
    const visibleWidth = visibleBlocks * 220 + (visibleBlocks - 1) * 24;
    
    // Enable/disable right arrow
    rightArrow.disabled = Math.abs(currentX) >= (totalWidth - visibleWidth);
}

// Design My Book Function
function designMyBook() {
    console.log('Design My Book button clicked!');
    
    // Get the number of pages selected
    const numberOfPages = document.getElementById('numberOfPages')?.value || '4';
    
    // Show loading state on the button
    const designButton = document.querySelector('.design-book-section .btn-primary');
    if (designButton) {
        designButton.innerHTML = '<span class="loading-icon">⏳</span> Processing...';
        designButton.disabled = true;
    }
    
    // Simulate processing time (you can replace this with actual API calls)
    setTimeout(() => {
        // Show the book preview section
        const previewSection = document.getElementById('bookPreviewSection');
        if (previewSection) {
            previewSection.style.display = 'block';
            initializeBookPreview();
        }
        
        // Show the download section
        const downloadSection = document.getElementById('downloadSection');
        if (downloadSection) {
            downloadSection.style.display = 'block';
        }
        
        // Reset button to normal state
        if (designButton) {
            designButton.innerHTML = '<span class="btn-text">Design My Book</span>';
            designButton.disabled = false;
        }
    }, 2000); // 2 second delay to show processing
    
    // You can add additional logic here for book design processing
    // For example: API calls, form validation, etc.
}

// Download Book Function
function downloadBook() {
    const downloadType = document.getElementById('downloadType')?.value || 'high-res-print';
    const downloadBtn = document.querySelector('.download-btn');
    
    // Show loading state
    if (downloadBtn) {
        downloadBtn.innerHTML = '<span class="loading-icon">⏳</span> Downloading...';
        downloadBtn.disabled = true;
    }
    
    // Simulate download processing (you can replace this with actual download logic)
    setTimeout(() => {
        // Reset button to normal state
        if (downloadBtn) {
            downloadBtn.innerHTML = '<span class="btn-text">Download</span>';
            downloadBtn.disabled = false;
        }
        
        // Show success message (you can customize this based on your needs)
        console.log(`Download initiated for: ${downloadType}`);
        
        // You can add actual download logic here:
        // - For PDFs: Generate and trigger download
        // - For images: Create zip file and download
        // - For ZIP: Package all files and download
    }, 2000); // 2 second delay to show processing
}

// Book Preview Functions
let currentPreviewIndex = 0;
const previewImages = [
    { src: 'images/Demo/Storybook/Childrens_Book_Mockup_1.png', label: 'Front Cover' },
    { src: 'images/Demo/Storybook/Childrens_Book_Mockup_2.png', label: 'Page 1' },
    { src: 'images/Demo/Storybook/Childrens_Book_Mockup_3.png', label: 'Page 2' },
    { src: 'images/Demo/Storybook/Childrens_Book_Mockup_4.png', label: 'Page 3' },
    { src: 'images/Demo/Storybook/Childrens_Book_Mockup_5.png', label: 'Page 4' },
    { src: 'images/Demo/Storybook/Childrens_Book_Mockup_6.png', label: 'Back Cover' }
];

function initializeBookPreview() {
    currentPreviewIndex = 0;
    updatePreviewImage();
    updatePreviewArrows();
}

function updatePreviewImage() {
    const previewImage = document.getElementById('previewImage');
    
    if (previewImage) {
        const currentImage = previewImages[currentPreviewIndex];
        previewImage.src = currentImage.src;
        
        // Handle image load error
        previewImage.onerror = function() {
            this.style.display = 'none';
        };
    }
}

function scrollPreview(direction) {
    if (direction === 'left') {
        currentPreviewIndex = (currentPreviewIndex - 1 + previewImages.length) % previewImages.length;
    } else {
        currentPreviewIndex = (currentPreviewIndex + 1) % previewImages.length;
    }
    
    updatePreviewImage();
    updatePreviewArrows();
}

function updatePreviewArrows() {
    const leftArrow = document.getElementById('previewLeftArrow');
    const rightArrow = document.getElementById('previewRightArrow');
    
    if (leftArrow && rightArrow) {
        // Both arrows are always enabled since we're cycling through images
        leftArrow.disabled = false;
        rightArrow.disabled = false;
    }
}

// Manual initialization for Step 3
function ensureStep3Initialized() {
    const step3 = document.getElementById('step3');
    if (step3 && step3.classList.contains('active')) {
        console.log('Step 3 is active, ensuring initialization');
        // Check if page blocks are already there
        const pageBlocksScroll = document.getElementById('pageBlocksScroll');
        if (pageBlocksScroll && pageBlocksScroll.children.length === 0) {
            console.log('Page blocks not found, initializing...');
            initializeBookDesign();
        } else {
            console.log('Page blocks already exist:', pageBlocksScroll?.children.length);
        }
    }
}

// Add event listener for when Step 3 becomes visible
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're already on Step 3
    setTimeout(() => {
        ensureStep3Initialized();
    }, 500);
});

// Watch for Step 3 visibility changes
function setupStep3Watcher() {
    const step3 = document.getElementById('step3');
    if (step3) {
        // Create a mutation observer to watch for class changes
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (step3.classList.contains('active')) {
                        console.log('Step 3 became active, initializing...');
                        // Wait a bit for DOM to settle, then initialize
                        setTimeout(() => {
                            initializeBookDesign();
                        }, 200);
                    }
                }
            });
        });
        
        // Start observing
        observer.observe(step3, { attributes: true });
        console.log('Step 3 watcher set up');
    }
}

// Initialize watcher when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setupStep3Watcher();
    
    // Also check if Step 3 is already active
    setTimeout(() => {
        const step3 = document.getElementById('step3');
        if (step3 && step3.classList.contains('active')) {
            console.log('Step 3 already active on page load, initializing...');
            initializeBookDesign();
        }
    }, 1000);
});

// Force initialization function (backup method)
function forceInitializeBookDesign() {
    console.log('Force initialization triggered');
    
    // Clear any existing content
    const pageBlocksScroll = document.getElementById('pageBlocksScroll');
    if (pageBlocksScroll) {
        pageBlocksScroll.innerHTML = '';
    }
    
    // Set default value
    const numberOfPagesSelect = document.getElementById('numberOfPages');
    if (numberOfPagesSelect) {
        numberOfPagesSelect.value = '4';
    }
    
    // Force update
    updateBookPages();
    
    console.log('Force initialization completed');
}

// Book workflow function for Step 2
function setupBookWorkflow() {
    console.log('Setting up book workflow...');
    
    // Prefill the prompt
    const promptTextarea = document.getElementById('promptInput');
    console.log('Looking for promptTextarea with ID "promptInput"');
    console.log('Found promptTextarea:', promptTextarea);
    
    if (promptTextarea) {
        const bookPrompt = `A 6-year-old boy with tousled dark brown hair, warm medium-brown skin, and large expressive eyes, wearing a bright red hoodie, denim shorts, and yellow sneakers — cheerful and curious. – His 10-year-old sister, slightly taller, with a long dark brown braid, warm medium-brown skin, and gentle eyes, wearing a dusty blue pinafore dress over a striped shirt, brown sandals, and a cloth bag — calm and thoughtful. – A small golden retriever puppy with fluffy light golden fur, floppy ears, big curious eyes, and a green collar with a round tag — playful and loyal. All illustrated in a consistent soft watercolor children's book style with a pastel color palette and painterly, layered textures. Scene - Watercolor storybook cover featuring three main characters: a cheerful 6-year-old boy with tousled dark brown hair, medium-brown skin, red hoodie, denim shorts, and yellow sneakers, holding a bright red kite loosely in one hand. Beside him stands his calm 10-year-old sister, slightly taller, with a long dark brown braid, medium-brown skin, wearing a dusty blue pinafore dress over a striped shirt, and a cloth shoulder bag. A golden retriever puppy sits at their feet, floppy ears and green collar, looking up playfully. Background: soft pastel sky with light clouds, subtle grassy field, gentle breeze shown with kite tail fluttering. Storybook title 'The Lost Kite' written in warm, hand-lettered style at the top. Whimsical, heartwarming tone, clean composition with ample white space and watercolor texture.`;
        
        console.log('Setting promptTextarea.value to book prompt...');
        promptTextarea.value = bookPrompt;
        console.log('Book prompt prefilled successfully');
        console.log('promptTextarea.value after setting:', promptTextarea.value);
    } else {
        console.log('Prompt textarea not found');
        console.log('Available textareas on page:', document.querySelectorAll('textarea'));
    }
}

// Function to populate book images when generate button is clicked
function populateBookImages() {
    console.log('Populating book images after generate...');
    
    // Clear existing generated images
    generatedImages = [];
    selectedImages = [];
    
    // Add the first generation (cover photos) to the generatedImages array
    const firstGeneration = {
        id: 'book-gen-1',
        prompt: 'A 6-year-old boy with tousled dark brown hair, warm medium-brown skin, and large expressive eyes, wearing a bright red hoodie, denim shorts, and yellow sneakers — cheerful and curious. – His 10-year-old sister, slightly taller, with a long dark brown braid, warm medium-brown skin, and gentle eyes, wearing a dusty blue pinafore dress over a striped shirt, brown sandals, and a cloth bag — calm and thoughtful. – A small golden retriever puppy with fluffy light golden fur, floppy ears, big curious eyes, and a green collar with a round tag — playful and loyal. All illustrated in a consistent soft watercolor children\'s book style with a pastel color palette and painterly, layered textures. Scene - Watercolor storybook cover featuring three main characters: a cheerful 6-year-old boy with tousled dark brown hair, medium-brown skin, red hoodie, denim shorts, and yellow sneakers, holding a bright red kite loosely in one hand. Beside him stands his calm 10-year-old sister, slightly taller, with a long dark brown braid, medium-brown skin, wearing a dusty blue pinafore dress over a striped shirt, and a cloth shoulder bag. A golden retriever puppy sits at their feet, floppy ears and green collar, looking up playfully. Background: soft pastel sky with light clouds, subtle grassy field, gentle breeze shown with kite tail fluttering. Storybook title \'The Lost Kite\' written in warm, hand-lettered style at the top. Whimsical, heartwarming tone, clean composition with ample white space and watercolor texture.',
        images: [
            {
                id: 'book-cover-1',
                url: 'images/Demo/Storybook/Cover Photo/CoverPhoto1.jpg',
                alt: 'Book Cover 1'
            },
            {
                id: 'book-cover-2',
                url: 'images/Demo/Storybook/Cover Photo/CoverPhoto2.jpg',
                alt: 'Book Cover 2'
            },
            {
                id: 'book-cover-3',
                url: 'images/Demo/Storybook/Cover Photo/CoverPhoto3.jpg',
                alt: 'Book Cover 3'
            },
            {
                id: 'book-cover-4',
                url: 'images/Demo/Storybook/Cover Photo/CoverPhoto4.jpg',
                alt: 'Book Cover 4'
            }
        ]
    };
    
    generatedImages.push(firstGeneration);
    
    // Use the existing display functions
    displayGeneratedImages();
    displaySelectedImages();
    
    console.log('Book cover images populated successfully');
    
    // Prefill the second prompt for the next generation
    const promptTextarea = document.getElementById('promptInput');
    if (promptTextarea) {
        const secondPrompt = `A 6-year-old boy with tousled dark brown hair, warm medium-brown skin, and large expressive eyes, wearing a bright red hoodie, denim shorts, and yellow sneakers — cheerful and curious. – His 10-year-old sister, slightly taller, with a long dark brown braid, warm medium-brown skin, and gentle eyes, wearing a dusty blue pinafore dress over a striped shirt, brown sandals, and a cloth journal bag — calm and thoughtful. – A small golden retriever puppy with fluffy light golden fur, floppy ears, big curious eyes, and a green collar with a round tag — playful and loyal. All illustrated in a consistent soft watercolor children's book style with a pastel color palette and painterly, layered textures. Scene - The garden is full of morning warmth—sunlight dapples the soft grass, casting long gentle shadows across the yard. Aarav, full of energy, stands mid-left, holding a vibrant red kite with one hand above his head. His tousled dark hair catches the light, and his yellow sneakers press into the grass like he's ready to sprint. His red hoodie flutters lightly in the breeze. His cheeks are round, his eyes wide with excitement. Amaya sits comfortably on a colorful picnic mat to the right, cross-legged, focused on a small cloth-bound journal in her lap. Her long braid curls beside her, and her striped shirt and blue pinafore give her a thoughtful, grounded appearance. She glances toward Aarav, amused. In the foreground, Miso, the puppy, tugs playfully at the kite's tail—his little green collar bouncing as he hops, tongue out and ears flopping. Surrounding them are spring flowers, a gently blowing clothesline, and a low white fence separating the yard from the quiet street beyond. The whole scene radiates childlike joy, curiosity, and a peaceful start to the day.`;
        promptTextarea.value = secondPrompt;
        console.log('Second prompt prefilled for next generation');
    }
}

// Function to add the second book generation
function addSecondBookGeneration() {
    console.log('Adding second book generation...');
    
    const generatedImagesContainer = document.getElementById('generatedImagesContainer');
    if (generatedImagesContainer) {
        // Create the second generation HTML
        const secondGenerationHTML = `
            <div class="generation-row">
                <div class="generation-header">
                    <h4>Generated Images</h4>
                    <p class="prompt-text">"A 6-year-old boy with tousled dark brown hair, warm medium-brown skin, and large expressive eyes, wearing a bright red hoodie, denim shorts, and yellow sneakers — cheerful and curious. – His 10-year-old sister, slightly taller, with a long dark brown braid, warm medium-brown skin, and gentle eyes, wearing a dusty blue pinafore dress over a striped shirt, brown sandals, and a cloth journal bag — calm and thoughtful. – A small golden retriever puppy with fluffy light golden fur, floppy ears, big curious eyes, and a green collar with a round tag — playful and loyal. All illustrated in a consistent soft watercolor children's book style with a pastel color palette and painterly, layered textures. Scene - The garden is full of morning warmth—sunlight dapples the soft grass, casting long gentle shadows across the yard. Aarav, full of energy, stands mid-left, holding a vibrant red kite with both hands above his head. His tousled dark hair catches the light, and his yellow sneakers press into the grass like he's ready to sprint. His red hoodie flutters lightly in the breeze. His cheeks are round, his eyes wide with excitement. Amaya sits comfortably on a colorful picnic mat to the right, cross-legged, focused on a small cloth-bound journal in her lap. Her long braid curls beside her, and her striped shirt and blue pinafore give her a thoughtful, grounded appearance. She glances toward Aarav, amused. In the foreground, Miso, the puppy, tugs playfully at the kite's tail—his little green collar bouncing as he hops, tongue out and ears flopping. Surrounding them are spring flowers, a gently blowing clothesline, and a low white fence separating the yard from the quiet street beyond. The whole scene radiates childlike joy, curiosity, and a peaceful start to the day."</p>
                </div>
                <div class="generated-images-grid">
                    <div class="generated-image">
                        <img src="images/Demo/Storybook/Page 1/exactly.ai_TimelessArtistry_A6-year-oldBoyWithTousledDarkBrownHairWarm_2025-08-26_10-11.jpeg" alt="Page 1 - Scene 1" onclick="selectImage(this)" onerror="console.log('Image failed to load:', this.src); console.log('Error details:', this.naturalWidth, 'x', this.naturalHeight);">
                    </div>
                    <div class="generated-image">
                        <img src="images/Demo/Storybook/Page 1/exactly.ai_TimelessArtistry_A6-year-oldBoyWithTousledDarkBrownHairWarm_2025-08-26_10-11 (1).jpeg" alt="Page 1 - Scene 2" onclick="selectImage(this)" onerror="console.log('Image failed to load:', this.src); console.log('Error details:', this.naturalWidth, 'x', this.naturalHeight);">
                    </div>
                    <div class="generated-image">
                        <img src="images/Demo/Storybook/Page 1/exactly.ai_TimelessArtistry_A6-year-oldBoyWithTousledDarkBrownHairWarm_2025-08-26_10-11 (2).jpeg" alt="Page 1 - Scene 3" onclick="selectImage(this)" onerror="console.log('Image failed to load:', this.src); console.log('Error details:', this.naturalWidth, 'x', this.naturalHeight);">
                    </div>
                    <div class="generated-image">
                        <img src="images/Demo/Storybook/Page 1/exactly.ai_TimelessArtistry_A6-year-oldBoyWithTousledDarkBrownHairWarm_2025-08-26_10-12.jpeg" alt="Page 1 - Scene 4" onclick="selectImage(this)" onerror="console.log('Image failed to load:', this.src); console.log('Error details:', this.naturalWidth, 'x', this.naturalHeight);">
                    </div>
                </div>
            </div>
        `;
        
        // Prepend the second generation to the existing content (newest first)
        generatedImagesContainer.insertAdjacentHTML('afterbegin', secondGenerationHTML);
        console.log('Second book generation added successfully');
        
        // Clear the prompt input after adding the second generation
        const promptInput = document.getElementById('promptInput');
        if (promptInput) {
            promptInput.value = '';
        }
        
        // Prefill the third prompt for the next generation
        const thirdPrompt = `A 6-year-old boy with tousled dark brown hair, warm medium-brown skin, and large expressive eyes, wearing a bright red hoodie, denim shorts, and yellow sneakers — cheerful and curious. – His 10-year-old sister, slightly taller, with a long dark brown braid, warm medium-brown skin, and gentle eyes, wearing a dusty blue pinafore dress over a striped shirt, brown sandals, and a cloth bag — calm and thoughtful. – A small golden retriever puppy with fluffy light golden fur, floppy ears, big curious eyes, and a green collar with a round tag — playful and loyal. All illustrated in a consistent soft watercolor children's book style with a pastel color palette and painterly, layered textures. Scene - Suddenly—WHOOSH!—a gust of wind yanks the kite from Aarav's hands. It's caught mid-air, rising diagonally across the page, soaring past rooftops and trees. Aarav is captured in full motion: arms outstretched, one leg mid-stride, and mouth open in shock as he chases the kite. His red hoodie lifts with the breeze, showing a flash of his t-shirt beneath. His body leans forward, all momentum. Aarav is surprised and shocked. Amaya is behind him, just rising from where she sat, her cloth bag now over one shoulder. Her eyes are wide, her body frozen for a beat before action. Her dress catches the wind at the hem. She's already analyzing the situation, steps behind her brother but mentally ahead. Miso is farthest ahead, a little streak of fluff and excitement. He's bounding down the cobbled path, tongue lolling, eyes on the sky as if he understands what they're after. The background shows the kite high above town rooftops, soaring over a lane flanked with flowering trees. A few petals fly by. This is the moment of panic, surprise, and pursuit. All three of them running towards the kite.`;
        promptInput.value = thirdPrompt;
        console.log('Third prompt prefilled for next generation');
    } else {
        console.log('Generated images container not found');
    }
}

// Function to add the third book generation
function addThirdBookGeneration() {
    console.log('Adding third book generation...');
    
    const generatedImagesContainer = document.getElementById('generatedImagesContainer');
    if (generatedImagesContainer) {
        // Create the third generation HTML
        const thirdGenerationHTML = `
            <div class="generation-row">
                <div class="generation-header">
                    <h4>Generated Images</h4>
                    <p class="prompt-text">"A 6-year-old boy with tousled dark brown hair, warm medium-brown skin, and large expressive eyes, wearing a bright red hoodie, denim shorts, and yellow sneakers — cheerful and curious. – His 10-year-old sister, slightly taller, with a long dark brown braid, warm medium-brown skin, and gentle eyes, wearing a dusty blue pinafore dress over a striped shirt, brown sandals, and a cloth bag — calm and thoughtful. – A small golden retriever puppy with fluffy light golden fur, floppy ears, big curious eyes, and a green collar with a round tag — playful and loyal. All illustrated in a consistent soft watercolor children's book style with a pastel color palette and painterly, layered textures. Scene - Suddenly—WHOOSH!—a gust of wind yanks the kite from Aarav's hands. It's caught mid-air, rising diagonally across the page, soaring past rooftops and trees. Aarav is captured in full motion: arms outstretched, one leg mid-stride, and mouth open in shock as he chases the kite. His red hoodie lifts with the breeze, showing a flash of his t-shirt beneath. His body leans forward, all momentum. Aarav is surprised and shocked. Amaya is behind him, just rising from where she sat, her cloth bag now over one shoulder. Her eyes are wide, her body frozen for a beat before action. Her dress catches the wind at the hem. She's already analyzing the situation, steps behind her brother but mentally ahead. Miso is farthest ahead, a little streak of fluff and excitement. He's bounding down the cobbled path, tongue lolling, eyes on the sky as if he understands what they're after. The background shows the kite high above town rooftops, soaring over a lane flanked with flowering trees. A few petals fly by. This is the moment of panic, surprise, and pursuit. All three of them running towards the kite."</p>
                </div>
                <div class="generated-images-grid">
                    <div class="generated-image">
                        <img src="images/Demo/Storybook/Page 2/exactly.ai_TimelessArtistry_A6-year-oldBoyWithTousledDarkBrownHairWarm_2025-08-26_10-08.jpeg" alt="Page 2 - Scene 1" onclick="selectImage(this)" onerror="console.log('Image failed to load:', this.src); console.log('Error details:', this.naturalWidth, 'x', this.naturalHeight);">
                    </div>
                    <div class="generated-image">
                        <img src="images/Demo/Storybook/Page 2/exactly.ai_TimelessArtistry_A6-year-oldBoyWithTousledDarkBrownHairWarm_2025-08-26_10-08 (2).jpeg" alt="Page 2 - Scene 2" onclick="selectImage(this)" onerror="console.log('Image failed to load:', this.src); console.log('Error details:', this.naturalWidth, 'x', this.naturalHeight);">
                    </div>
                    <div class="generated-image">
                        <img src="images/Demo/Storybook/Page 2/exactly.ai_TimelessArtistry_A6-year-oldBoyWithTousledDarkBrownHairWarm_2025-08-26_10-08 (3).jpeg" alt="Page 2 - Scene 3" onclick="selectImage(this)" onerror="console.log('Image failed to load:', this.src); console.log('Error details:', this.naturalWidth, 'x', this.naturalHeight);">
                    </div>
                    <div class="generated-image">
                        <img src="images/Demo/Storybook/Page 2/exactly.ai_TimelessArtistry_A6-year-oldBoyWithTousledDarkBrownHairWarm_2025-08-26_10-08 (4).jpeg" alt="Page 2 - Scene 4" onclick="selectImage(this)" onerror="console.log('Image failed to load:', this.src); console.log('Error details:', this.naturalWidth, 'x', this.naturalHeight);">
                    </div>
                </div>
            </div>
        `;
        
        // Prepend the third generation to the existing content (newest first)
        generatedImagesContainer.insertAdjacentHTML('afterbegin', thirdGenerationHTML);
        console.log('Third book generation added successfully');
        
        // Clear the prompt input after adding the third generation
        const promptInput = document.getElementById('promptInput');
        if (promptInput) {
            promptInput.value = '';
        }
        
        // Prefill the fourth prompt for the next generation
        const fourthPrompt = `A 6-year-old boy with tousled dark brown hair, warm medium-brown skin, and large expressive eyes, wearing a bright red hoodie, denim shorts, and yellow sneakers — cheerful and curious. – His 10-year-old sister, slightly taller, with a long dark brown braid, warm medium-brown skin, and gentle eyes, wearing a dusty blue pinafore dress over a striped shirt, brown sandals, and a cloth bag — calm and thoughtful. – A small golden retriever puppy with fluffy light golden fur, floppy ears, big curious eyes, and a green collar with a round tag — playful and loyal. All illustrated in a consistent soft watercolor children's book style with a pastel color palette and painterly, layered textures. Scene - The trio has followed the trail to the edge of a calm, almost magical forest. Towering trees filter sunlight into scattered golden beams. The kite is stuck in a crooked old tree. The kite is within the leaves of the tree. Aarav stands at the base of the tree, looking up in awe and frustration, his hands clenched loosely at his sides. His hoodie has dirt smudges now. He looks small against the grandeur of the forest. He is upset that the kite flew away. pointg to the kite. Amaya is crouched next to a large rock, her cloth bag beside her, its flap open to reveal tools like a small notebook, a flashlight, and some rope. She's sketching something quickly or pointing at the tree's trunk, mapping a climbing path. Her expression is serious, strategic. Miso barks with enthusiasm, jumping up at the tree's bark. His tail blurs with motion, clearly wanting to help. The tree itself is ancient and wide, with textured bark and low sturdy branches. Moss grows near its roots. There are soft glows of forest light—a magical stillness, as if the forest has paused to watch them. 🌿 Mood: Quiet, enchanted, thoughtful`;
        promptInput.value = fourthPrompt;
        console.log('Fourth prompt prefilled for next generation');
    } else {
        console.log('Generated images container not found');
    }
}

// Function to add the fourth book generation
function addFourthBookGeneration() {
    console.log('Adding fourth book generation...');
    
    // Add the fourth generation to the generatedImages array
    const fourthGeneration = {
        id: 'book-gen-4',
        prompt: 'A 6-year-old boy with tousled dark brown hair, warm medium-brown skin, and large expressive eyes, wearing a bright red hoodie, denim shorts, and yellow sneakers — cheerful and curious. – His 10-year-old sister, slightly taller, with a long dark brown braid, warm medium-brown skin, and gentle eyes, wearing a dusty blue pinafore dress over a striped shirt, brown sandals, and a cloth bag — calm and thoughtful. – A small golden retriever puppy with fluffy light golden fur, floppy ears, big curious eyes, and a green collar with a round tag — playful and loyal. All illustrated in a consistent soft watercolor children\'s book style with a pastel color palette and painterly, layered textures. Scene - The trio has followed the trail to the edge of a calm, almost magical forest. Towering trees filter sunlight into scattered golden beams. The kite is stuck in a crooked old tree. The kite is within the leaves of the tree. Aarav stands at the base of the tree, looking up in awe and frustration, his hands clenched loosely at his sides. His hoodie has dirt smudges now. He looks small against the grandeur of the forest. He is upset that the kite flew away. pointg to the kite. Amaya is crouched next to a large rock, her cloth bag beside her, its flap open to reveal tools like a small notebook, a flashlight, and some rope. She\'s sketching something quickly or pointing at the tree\'s trunk, mapping a climbing path. Her expression is serious, strategic. Miso barks with enthusiasm, jumping up at the tree\'s bark. His tail blurs with motion, clearly wanting to help. The tree itself is ancient and wide, with textured bark and low sturdy branches. Moss grows near its roots. There are soft glows of forest light—a magical stillness, as if the forest has paused to watch them. 🌿 Mood: Quiet, enchanted, thoughtful',
        images: [
            {
                id: 'book-page3-1',
                url: 'images/Demo/Storybook/Page 3/exactly.ai_TimelessArtistry_A6-year-oldBoyWithTousledDarkBrownHairWarm_2025-08-26_10-07.jpeg',
                alt: 'Page 3 - Scene 1'
            },
            {
                id: 'book-page3-2',
                url: 'images/Demo/Storybook/Page 3/exactly.ai_TimelessArtistry_A6-year-oldBoyWithTousledDarkBrownHairWarm_2025-08-26_10-08 (1).jpeg',
                alt: 'Page 3 - Scene 2'
            },
            {
                id: 'book-page3-3',
                url: 'images/Demo/Storybook/Page 3/exactly.ai_TimelessArtistry_A6-year-oldBoyWithTousledDarkBrownHairWarm_2025-08-26_10-09.jpeg',
                alt: 'Page 3 - Scene 3'
            },
            {
                id: 'book-page3-4',
                url: 'images/Demo/Storybook/Page 3/exactly.ai_TimelessArtistry_A6-year-oldBoyWithTousledDarkBrownHairWarm_2025-08-26_10-09 (1).jpeg',
                alt: 'Page 3 - Scene 4'
            }
        ]
    };
    
    // Add to the beginning of the array (newest first)
    generatedImages.unshift(fourthGeneration);
    
    // Use the existing display functions
    displayGeneratedImages();
    displaySelectedImages();
    
    console.log('Fourth book generation added successfully');
    
    // Clear the prompt input after adding the fourth generation
    const promptInput = document.getElementById('promptInput');
    if (promptInput) {
        promptInput.value = '';
    }
    
    // Prefill the fifth prompt for the next generation
    const fifthPrompt = `A 6-year-old boy with tousled dark brown hair, warm medium-brown skin, and large expressive eyes, wearing a bright red hoodie, denim shorts, and yellow sneakers — cheerful and curious. – His 10-year-old sister, slightly taller, with a long dark brown braid, warm medium-brown skin, and gentle eyes, wearing a dusty blue pinafore dress over a striped shirt, brown sandals, and a cloth bag — calm and thoughtful. – A small golden retriever puppy with fluffy light golden fur, floppy ears, big curious eyes, and a green collar with a round tag — playful and loyal. All illustrated in a consistent soft watercolor children's book style with a pastel color palette and painterly, layered textures. Scene - Aarav is mid-climb—he's halfway up a strong, low tree branch. His hands grip the bark; one foot is on a knotted root-turned-foothold. His red hoodie is snagged slightly, one sleeve pushed up. He's reaching upward, face filled with determination and just a touch of fear. His body is taut with focus. The red kite flutters a few branches above him, just out of reach but now close enough to feel real again. Below, Amaya stands on tiptoes, arms raised just slightly—not to catch, but to encourage. Her cloth bag is now across her chest, half open, a coil of rope visible inside`;
    promptInput.value = fifthPrompt;
    console.log('Fifth prompt prefilled for next generation');
}

// Function to add the fifth book generation
function addFifthBookGeneration() {
    console.log('Adding fifth book generation...');
    
    // Add the fifth generation to the generatedImages array
    const fifthGeneration = {
        id: 'book-gen-5',
        prompt: 'A 6-year-old boy with tousled dark brown hair, warm medium-brown skin, and large expressive eyes, wearing a bright red hoodie, denim shorts, and yellow sneakers — cheerful and curious. – His 10-year-old sister, slightly taller, with a long dark brown braid, warm medium-brown skin, and gentle eyes, wearing a dusty blue pinafore dress over a striped shirt, brown sandals, and a cloth bag — calm and thoughtful. – A small golden retriever puppy with fluffy light golden fur, floppy ears, big curious eyes, and a green collar with a round tag — playful and loyal. All illustrated in a consistent soft watercolor children\'s book style with a pastel color palette and painterly, layered textures. Scene - Aarav is mid-climb—he\'s halfway up a strong, low tree branch. His hands grip the bark; one foot is on a knotted root-turned-foothold. His red hoodie is snagged slightly, one sleeve pushed up. He\'s reaching upward, face filled with determination and just a touch of fear. His body is taut with focus. The red kite flutters a few branches above him, just out of reach but now close enough to feel real again. Below, Amaya stands on tiptoes, arms raised just slightly—not to catch, but to encourage. Her cloth bag is now across her chest, half open, a coil of rope visible inside',
        images: [
            {
                id: 'book-page4-1',
                url: 'images/Demo/Storybook/Page 4/exactly.ai_TimelessArtistry_A6-year-oldBoyWithTousledDarkBrownHairWarm_2025-08-26_10-04.jpeg',
                alt: 'Page 4 - Scene 1'
            },
            {
                id: 'book-page4-2',
                url: 'images/Demo/Storybook/Page 4/exactly.ai_TimelessArtistry_A6-year-oldBoyWithTousledDarkBrownHairWarm_2025-08-26_10-05.jpeg',
                alt: 'Page 4 - Scene 2'
            },
            {
                id: 'book-page4-3',
                url: 'images/Demo/Storybook/Page 4/exactly.ai_TimelessArtistry_A6-year-oldBoyWithTousledDarkBrownHairWarm_2025-08-26_10-05 (1).jpeg',
                alt: 'Page 4 - Scene 3'
            },
            {
                id: 'book-page4-4',
                url: 'images/Demo/Storybook/Page 4/exactly.ai_TimelessArtistry_A6-year-oldBoyWithTousledDarkBrownHairWarm_2025-08-26_10-05 (2).jpeg',
                alt: 'Page 4 - Scene 4'
            }
        ]
    };
    
    // Add to the beginning of the array (newest first)
    generatedImages.unshift(fifthGeneration);
    
    // Use the existing display functions
    displayGeneratedImages();
    displaySelectedImages();
    
    console.log('Fifth book generation added successfully');
    
    // Clear the prompt input after adding the fifth generation
    const promptInput = document.getElementById('promptInput');
    if (promptInput) {
        promptInput.value = '';
    }
    
    // Prefill the sixth prompt for the next generation
    const sixthPrompt = `A 6-year-old boy with tousled dark brown hair, warm medium-brown skin, and large expressive eyes, wearing a bright red hoodie, denim shorts, and yellow sneakers — cheerful and curious. – His 10-year-old sister, slightly taller, with a long dark brown braid, warm medium-brown skin, and gentle eyes, wearing a dusty blue pinafore dress over a striped shirt, brown sandals, and a cloth bag — calm and thoughtful. – A small golden retriever puppy with fluffy light golden fur, floppy ears, big curious eyes, and a green collar with a round tag — playful and loyal. All illustrated in a consistent soft watercolor children's book style with a pastel color palette and painterly, layered textures. Scene - The three are back at home, sitting on the front steps. Aarav is at the center, legs swinging, holding the kite across his knees. Aarav is holding his red kite. Amaya is beside him, pulling something from her bag (maybe a pencil or snack). Miso is curled up at their feet, finally still. Background: The house's front porch and doorframe are lightly detailed, bathed in soft sunset tones. Maybe a potted plant, a light on. Mood: Cozy, complete, and settled. Make the kids younger.`;
    promptInput.value = sixthPrompt;
    console.log('Sixth prompt prefilled for next generation');
}

// Function to add the sixth book generation
function addSixthBookGeneration() {
    console.log('Adding sixth book generation...');
    
    // Add the sixth generation to the generatedImages array
    const sixthGeneration = {
        id: 'book-gen-6',
        prompt: 'A 6-year-old boy with tousled dark brown hair, warm medium-brown skin, and large expressive eyes, wearing a bright red hoodie, denim shorts, and yellow sneakers — cheerful and curious. – His 10-year-old sister, slightly taller, with a long dark brown braid, warm medium-brown skin, and gentle eyes, wearing a dusty blue pinafore dress over a striped shirt, brown sandals, and a cloth bag — calm and thoughtful. – A small golden retriever puppy with fluffy light golden fur, floppy ears, big curious eyes, and a green collar with a round tag — playful and loyal. All illustrated in a consistent soft watercolor children\'s book style with a pastel color palette and painterly, layered textures. Scene - The three are back at home, sitting on the front steps. Aarav is at the center, legs swinging, holding the kite across his knees. Aarav is holding his red kite. Amaya is beside him, pulling something from her bag (maybe a pencil or snack). Miso is curled up at their feet, finally still. Background: The house\'s front porch and doorframe are lightly detailed, bathed in soft sunset tones. Maybe a potted plant, a light on. Mood: Cozy, complete, and settled. Make the kids younger.',
        images: [
            {
                id: 'book-page5-1',
                url: 'images/Demo/Storybook/Page 5/exactly.ai_TimelessArtistry_A6-year-oldBoyWithTousledDarkBrownHairWarm_2025-08-26_09-59 (2).jpeg',
                alt: 'Page 5 - Scene 3'
            },
            {
                id: 'book-page5-2',
                url: 'images/Demo/Storybook/Page 5/exactly.ai_TimelessArtistry_A6-year-oldBoyWithTousledDarkBrownHairWarm_2025-08-26_10-04.jpeg',
                alt: 'Page 5 - Scene 4'
            },
            {
                id: 'book-page5-3',
                url: 'images/Demo/Storybook/Page 5/exactly.ai_TimelessArtistry_A6-year-oldBoyWithTousledDarkBrownHairWarm_2025-08-26_09-59.jpeg',
                alt: 'Page 5 - Scene 5'
            },
            {
                id: 'book-page5-4',
                url: 'images/Demo/Storybook/Page 5/exactly.ai_TimelessArtistry_A6-year-oldBoyWithTousledDarkBrownHairWarm_2025-08-26_09-59 (1).jpeg',
                alt: 'Page 5 - Scene 6'
            }
        ]
    };
    
    // Add to the beginning of the array (newest first)
    generatedImages.unshift(sixthGeneration);
    
    // Use the existing display functions
    displayGeneratedImages();
    displaySelectedImages();
    
    console.log('Sixth book generation added successfully');
    
    // Clear the prompt input after adding the sixth generation
    const promptInput = document.getElementById('promptInput');
    if (promptInput) {
        promptInput.value = '';
    }
    
    console.log('All 6 generations have been completed!');
}
