// ===== LoRA Training JavaScript =====

// Global variables
let uploadedImages = [];
let currentModel = null;
let trainingJob = null;

// DOM elements
const uploadZone = document.getElementById('uploadZone');
const imageInput = document.getElementById('imageInput');
const imagePreviewGrid = document.getElementById('imagePreviewGrid');
const nextToTrainingBtn = document.getElementById('nextToTraining');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeUploadZone();
    initializeControls();
    initializeMobileMenu();
});

// ===== Upload Zone Functionality =====

function initializeUploadZone() {
    // Click to upload
    uploadZone.addEventListener('click', () => {
        imageInput.click();
    });

    // File input change
    imageInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadZone.addEventListener('dragover', handleDragOver);
    uploadZone.addEventListener('dragleave', handleDragLeave);
    uploadZone.addEventListener('drop', handleDrop);
}

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    processFiles(files);
}

function handleDragOver(event) {
    event.preventDefault();
    uploadZone.classList.add('drag-over');
}

function handleDragLeave(event) {
    event.preventDefault();
    uploadZone.classList.remove('drag-over');
}

function handleDrop(event) {
    event.preventDefault();
    uploadZone.classList.remove('drag-over');
    
    const files = Array.from(event.dataTransfer.files);
    processFiles(files);
}

function processFiles(files) {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (uploadedImages.length + imageFiles.length > 10) {
        showNotification('You can only upload 10 images maximum.', 'error');
        return;
    }

    imageFiles.forEach(file => {
        if (uploadedImages.length >= 10) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Validate image dimensions
                if (img.width < 512 || img.height < 512) {
                    showNotification(`Image ${file.name} is too small. Minimum size is 512x512 pixels.`, 'error');
                    return;
                }
                
                addImageToPreview(file, e.target.result);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function addImageToPreview(file, dataUrl) {
    const imageData = {
        file: file,
        dataUrl: dataUrl,
        id: Date.now() + Math.random()
    };
    
    uploadedImages.push(imageData);
    updateImagePreview();
    updateNextButton();
}

function removeImage(imageId) {
    uploadedImages = uploadedImages.filter(img => img.id !== imageId);
    updateImagePreview();
    updateNextButton();
}

function updateImagePreview() {
    imagePreviewGrid.innerHTML = '';
    
    uploadedImages.forEach((imageData, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'image-preview-item fade-in';
        previewItem.innerHTML = `
            <img src="${imageData.dataUrl}" alt="Preview ${index + 1}">
            <button class="remove-btn" onclick="removeImage(${imageData.id})">×</button>
            <div class="image-number">${index + 1}</div>
        `;
        imagePreviewGrid.appendChild(previewItem);
    });
}

function updateNextButton() {
    const isValid = uploadedImages.length === 10;
    nextToTrainingBtn.disabled = !isValid;
    
    if (isValid) {
        nextToTrainingBtn.textContent = 'Continue to Training (10/10)';
    } else {
        nextToTrainingBtn.textContent = `Continue to Training (${uploadedImages.length}/10)`;
    }
}

// ===== Step Navigation =====

function nextStep(step) {
    hideAllSteps();
    document.getElementById(`step-${step}`).style.display = 'block';
    
    if (step === 'training') {
        initializeTrainingStep();
    } else if (step === 'generation') {
        initializeGenerationStep();
    }
}

function prevStep(step) {
    hideAllSteps();
    document.getElementById(`step-${step}`).style.display = 'block';
}

function hideAllSteps() {
    document.querySelectorAll('.training-step').forEach(step => {
        step.style.display = 'none';
    });
}

// ===== Training Step =====

function initializeTrainingStep() {
    // Auto-generate model name if empty
    const modelNameInput = document.getElementById('modelName');
    if (!modelNameInput.value) {
        const timestamp = new Date().toISOString().slice(0, 10);
        modelNameInput.value = `MyStyle_${timestamp}`;
    }
    
    // Initialize range controls
    initializeRangeControls();
}

function initializeRangeControls() {
    const guidanceScale = document.getElementById('guidanceScale');
    const guidanceValue = document.getElementById('guidanceValue');
    const numSteps = document.getElementById('numSteps');
    const stepsValue = document.getElementById('stepsValue');
    
    guidanceScale.addEventListener('input', function() {
        guidanceValue.textContent = this.value;
    });
    
    numSteps.addEventListener('input', function() {
        stepsValue.textContent = this.value;
    });
}

function startTraining() {
    const modelName = document.getElementById('modelName').value;
    const trainingSteps = document.getElementById('trainingSteps').value;
    const learningRate = document.getElementById('learningRate').value;
    const resolution = document.getElementById('resolution').value;
    
    if (!modelName.trim()) {
        showNotification('Please enter a model name.', 'error');
        return;
    }
    
    // Show training status
    document.getElementById('trainingStatus').style.display = 'block';
    document.getElementById('startTraining').disabled = true;
    document.getElementById('startTraining').textContent = 'Training...';
    
    // Prepare training data
    const trainingData = {
        modelName: modelName,
        trainingSteps: parseInt(trainingSteps),
        learningRate: parseFloat(learningRate),
        resolution: parseInt(resolution),
        images: uploadedImages.map(img => ({
            name: img.file.name,
            data: img.dataUrl.split(',')[1] // Remove data URL prefix
        }))
    };
    
    // Start training process
    startTrainingProcess(trainingData);
}

function startTrainingProcess(trainingData) {
    // Simulate training progress (replace with actual API calls)
    let progress = 0;
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const trainingLog = document.getElementById('trainingLog');
    
    const trainingInterval = setInterval(() => {
        progress += Math.random() * 5;
        if (progress > 100) progress = 100;
        
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;
        
        // Add log entries
        if (progress < 30) {
            addLogEntry('Initializing training environment...');
        } else if (progress < 60) {
            addLogEntry('Processing training images...');
        } else if (progress < 90) {
            addLogEntry('Training LoRA model...');
        } else if (progress >= 100) {
            addLogEntry('Training completed successfully!');
            clearInterval(trainingInterval);
            trainingCompleted(trainingData);
        }
    }, 1000);
    
    // Store training job reference
    trainingJob = {
        interval: trainingInterval,
        data: trainingData
    };
}

function addLogEntry(message) {
    const trainingLog = document.getElementById('trainingLog');
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.textContent = `[${timestamp}] ${message}`;
    trainingLog.appendChild(logEntry);
    trainingLog.scrollTop = trainingLog.scrollHeight;
}

function trainingCompleted(trainingData) {
    // Create model object
    currentModel = {
        id: 'model_' + Date.now(),
        name: trainingData.modelName,
        trainingTime: new Date().toISOString(),
        status: 'Ready',
        config: trainingData
    };
    
    // Update UI
    document.getElementById('startTraining').textContent = 'Training Complete!';
    document.getElementById('startTraining').classList.add('success');
    
    // Show success notification
    showNotification('LoRA model training completed successfully!', 'success');
    
    // Auto-advance to generation step after 2 seconds
    setTimeout(() => {
        nextStep('generation');
    }, 2000);
}

// ===== Generation Step =====

function initializeGenerationStep() {
    if (currentModel) {
        // Update model information
        document.getElementById('modelNameDisplay').textContent = currentModel.name;
        document.getElementById('modelIdDisplay').textContent = currentModel.id;
        document.getElementById('trainingTimeDisplay').textContent = new Date(currentModel.trainingTime).toLocaleString();
        document.getElementById('modelStatusDisplay').textContent = currentModel.status;
    }
    
    // Initialize generation controls
    initializeGenerationControls();
}

function initializeGenerationControls() {
    // Set default seed to random
    const seedInput = document.getElementById('seed');
    seedInput.value = Math.floor(Math.random() * 1000000);
}

function generateImage() {
    const prompt = document.getElementById('promptInput').value.trim();
    const negativePrompt = document.getElementById('negativePrompt').value.trim();
    const guidanceScale = document.getElementById('guidanceScale').value;
    const numSteps = document.getElementById('numSteps').value;
    const seed = document.getElementById('seed').value;
    
    if (!prompt) {
        showNotification('Please enter a prompt.', 'error');
        return;
    }
    
    if (!currentModel) {
        showNotification('No model available for generation.', 'error');
        return;
    }
    
    // Show loading state
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating...';
    
    // Hide placeholder
    document.getElementById('resultPlaceholder').style.display = 'none';
    
    // Prepare generation request
    const generationData = {
        modelId: currentModel.id,
        prompt: prompt,
        negativePrompt: negativePrompt || 'blurry, low quality, distorted',
        guidanceScale: parseFloat(guidanceScale),
        numSteps: parseInt(numSteps),
        seed: seed ? parseInt(seed) : Math.floor(Math.random() * 1000000),
        width: 512,
        height: 512
    };
    
    // Start generation process
    startGenerationProcess(generationData);
}

function startGenerationProcess(generationData) {
    // Simulate generation (replace with actual API calls)
    setTimeout(() => {
        // Generate a placeholder image (replace with actual generation)
        const generatedImageUrl = generatePlaceholderImage(generationData);
        
        // Add generated image to results
        addGeneratedImage(generatedImageUrl, generationData);
        
        // Reset button
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.disabled = false;
        generateBtn.textContent = 'Generate Image';
        
        // Show success notification
        showNotification('Image generated successfully!', 'success');
    }, 3000);
}

function generatePlaceholderImage(generationData) {
    // Create a canvas with the prompt as a placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Generated Image', 256, 200);
    
    ctx.font = '16px Arial';
    ctx.fillText(generationData.prompt.substring(0, 40) + '...', 256, 240);
    
    ctx.font = '12px Arial';
    ctx.fillText(`Seed: ${generationData.seed}`, 256, 280);
    
    return canvas.toDataURL();
}

function addGeneratedImage(imageUrl, generationData) {
    const generatedImages = document.getElementById('generatedImages');
    const imageContainer = document.createElement('div');
    imageContainer.className = 'generated-image fade-in';
    
    imageContainer.innerHTML = `
        <img src="${imageUrl}" alt="Generated image">
        <div class="image-actions">
            <button onclick="downloadImage('${imageUrl}', '${generationData.prompt}')">Download</button>
            <button onclick="regenerateImage()">Regenerate</button>
        </div>
    `;
    
    generatedImages.appendChild(imageContainer);
}

// ===== Utility Functions =====

function downloadImage(imageUrl, prompt) {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated_${prompt.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function regenerateImage() {
    // Generate new seed
    document.getElementById('seed').value = Math.floor(Math.random() * 1000000);
    generateImage();
}

function downloadModel() {
    if (!currentModel) {
        showNotification('No model available for download.', 'error');
        return;
    }
    
    // Create model data for download
    const modelData = {
        model: currentModel,
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(modelData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentModel.name}_model.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Model information downloaded!', 'success');
}

function shareModel() {
    if (!currentModel) {
        showNotification('No model available to share.', 'error');
        return;
    }
    
    // Create shareable link (replace with actual sharing logic)
    const shareUrl = `${window.location.origin}/share/${currentModel.id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
        showNotification('Share link copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy share link.', 'error');
    });
}

function startNewTraining() {
    // Reset all data
    uploadedImages = [];
    currentModel = null;
    trainingJob = null;
    
    // Reset UI
    imagePreviewGrid.innerHTML = '';
    updateNextButton();
    
    // Reset form fields
    document.getElementById('modelName').value = '';
    document.getElementById('promptInput').value = '';
    document.getElementById('negativePrompt').value = '';
    document.getElementById('seed').value = Math.floor(Math.random() * 1000000);
    
    // Reset buttons
    document.getElementById('startTraining').disabled = false;
    document.getElementById('startTraining').textContent = 'Start Training';
    document.getElementById('startTraining').classList.remove('success');
    
    // Hide training status
    document.getElementById('trainingStatus').style.display = 'none';
    
    // Show placeholder
    document.getElementById('resultPlaceholder').style.display = 'flex';
    document.getElementById('generatedImages').innerHTML = '';
    
    // Go back to first step
    nextStep('upload');
    
    showNotification('Ready to start a new training session!', 'success');
}

// ===== Notifications =====

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = '#10B981';
            break;
        case 'error':
            notification.style.background = '#EF4444';
            break;
        case 'warning':
            notification.style.background = '#F59E0B';
            break;
        default:
            notification.style.background = '#3B82F6';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// ===== Mobile Menu =====

function initializeMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!nav.contains(e.target) && !mobileMenuToggle.contains(e.target) && nav.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}

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

// ===== Analytics =====

function trackEvent(eventName, parameters = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, parameters);
    }
}

// Track important user actions
document.addEventListener('DOMContentLoaded', function() {
    // Track page view
    trackEvent('page_view', {
        page_title: 'LoRA Training',
        page_location: window.location.href
    });
    
    // Track file uploads
    const imageInput = document.getElementById('imageInput');
    imageInput.addEventListener('change', function() {
        trackEvent('file_upload', {
            file_count: this.files.length,
            file_types: Array.from(this.files).map(f => f.type)
        });
    });
    
    // Track training starts
    const startTrainingBtn = document.getElementById('startTraining');
    startTrainingBtn.addEventListener('click', function() {
        trackEvent('training_started', {
            model_name: document.getElementById('modelName').value,
            training_steps: document.getElementById('trainingSteps').value
        });
    });
    
    // Track generations
    const generateBtn = document.getElementById('generateBtn');
    generateBtn.addEventListener('click', function() {
        trackEvent('image_generated', {
            prompt_length: document.getElementById('promptInput').value.length,
            guidance_scale: document.getElementById('guidanceScale').value
        });
    });
}); 