#!/usr/bin/env python3
"""
MuseAI LoRA Training API
A comprehensive backend for training and serving LoRA models
"""

import os
import json
import uuid
import base64
import asyncio
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
from diffusers.loaders import AttnProcsLayers
from diffusers.models.attention_processor import LoRAAttnProcessor
import transformers
from PIL import Image
import numpy as np

from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="MuseAI LoRA Training API",
    description="API for training and serving LoRA models",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MODEL_DIR = Path("models")
UPLOAD_DIR = Path("uploads")
GENERATED_DIR = Path("generated")
BASE_MODEL = "runwayml/stable-diffusion-v1-5"

# Ensure directories exist
MODEL_DIR.mkdir(exist_ok=True)
UPLOAD_DIR.mkdir(exist_ok=True)
GENERATED_DIR.mkdir(exist_ok=True)

# Global variables
training_jobs: Dict[str, Dict] = {}
loaded_models: Dict[str, Any] = {}

# Pydantic models
class TrainingRequest(BaseModel):
    model_name: str = Field(..., description="Name for the LoRA model")
    training_steps: int = Field(1000, ge=100, le=5000, description="Number of training steps")
    learning_rate: float = Field(1e-4, ge=1e-5, le=1e-3, description="Learning rate")
    resolution: int = Field(512, ge=512, le=1024, description="Training resolution")
    images: List[str] = Field(..., min_items=5, max_items=20, description="Base64 encoded images")

class GenerationRequest(BaseModel):
    model_id: str = Field(..., description="ID of the trained model")
    prompt: str = Field(..., description="Text prompt for generation")
    negative_prompt: str = Field("blurry, low quality, distorted", description="Negative prompt")
    guidance_scale: float = Field(7.0, ge=1.0, le=20.0, description="Guidance scale")
    num_steps: int = Field(30, ge=20, le=50, description="Number of inference steps")
    seed: Optional[int] = Field(None, description="Random seed")
    width: int = Field(512, ge=512, le=1024, description="Image width")
    height: int = Field(512, ge=512, le=1024, description="Image height")

class TrainingStatus(BaseModel):
    job_id: str
    status: str
    progress: float
    message: str
    model_id: Optional[str] = None

class ModelInfo(BaseModel):
    model_id: str
    name: str
    training_time: str
    status: str
    config: Dict[str, Any]

# Utility functions
def save_base64_image(base64_data: str, filename: str) -> Path:
    """Save base64 image data to file"""
    try:
        # Remove data URL prefix if present
        if base64_data.startswith('data:image'):
            base64_data = base64_data.split(',')[1]
        
        image_data = base64.b64decode(base64_data)
        file_path = UPLOAD_DIR / filename
        
        with open(file_path, 'wb') as f:
            f.write(image_data)
        
        return file_path
    except Exception as e:
        logger.error(f"Error saving image {filename}: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid image data: {filename}")

def load_model(model_id: str) -> Any:
    """Load a trained LoRA model"""
    if model_id in loaded_models:
        return loaded_models[model_id]
    
    model_path = MODEL_DIR / model_id
    if not model_path.exists():
        raise HTTPException(status_code=404, detail="Model not found")
    
    try:
        # Load the base pipeline
        pipeline = StableDiffusionPipeline.from_pretrained(
            BASE_MODEL,
            torch_dtype=torch.float16,
            safety_checker=None
        )
        
        # Load LoRA weights
        pipeline.load_lora_weights(str(model_path))
        
        # Optimize for inference
        pipeline.scheduler = DPMSolverMultistepScheduler.from_config(pipeline.scheduler.config)
        
        if torch.cuda.is_available():
            pipeline = pipeline.to("cuda")
        
        loaded_models[model_id] = pipeline
        return pipeline
    
    except Exception as e:
        logger.error(f"Error loading model {model_id}: {e}")
        raise HTTPException(status_code=500, detail="Error loading model")

# Training functions
async def train_lora_model(job_id: str, training_data: Dict[str, Any]):
    """Background task for training LoRA model"""
    try:
        training_jobs[job_id]["status"] = "training"
        training_jobs[job_id]["progress"] = 0.0
        training_jobs[job_id]["message"] = "Initializing training environment..."
        
        # Save training images
        image_paths = []
        for i, image_data in enumerate(training_data["images"]):
            filename = f"{job_id}_image_{i}.png"
            image_path = save_base64_image(image_data["data"], filename)
            image_paths.append(str(image_path))
        
        training_jobs[job_id]["progress"] = 10.0
        training_jobs[job_id]["message"] = "Processing training images..."
        
        # Load base model
        pipeline = StableDiffusionPipeline.from_pretrained(
            BASE_MODEL,
            torch_dtype=torch.float16
        )
        
        if torch.cuda.is_available():
            pipeline = pipeline.to("cuda")
        
        training_jobs[job_id]["progress"] = 20.0
        training_jobs[job_id]["message"] = "Setting up LoRA training..."
        
        # Configure LoRA
        lora_rank = 16
        lora_alpha = 32
        
        # Add LoRA to attention layers
        for name, module in pipeline.unet.named_modules():
            if "attn2" in name and isinstance(module, nn.MultiheadAttention):
                module.register_forward_hook(
                    lambda module, input, output: output
                )
        
        # Prepare training data
        from torchvision import transforms
        
        transform = transforms.Compose([
            transforms.Resize((training_data["resolution"], training_data["resolution"])),
            transforms.ToTensor(),
            transforms.Normalize([0.5], [0.5])
        ])
        
        # Load and preprocess images
        images = []
        for image_path in image_paths:
            image = Image.open(image_path).convert("RGB")
            image_tensor = transform(image)
            images.append(image_tensor)
        
        training_jobs[job_id]["progress"] = 30.0
        training_jobs[job_id]["message"] = "Training LoRA model..."
        
        # Training loop (simplified - replace with actual LoRA training)
        optimizer = torch.optim.AdamW(
            pipeline.unet.parameters(),
            lr=training_data["learning_rate"]
        )
        
        for step in range(training_data["training_steps"]):
            # Simulate training step
            loss = torch.tensor(0.1)  # Placeholder loss
            
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            # Update progress
            progress = 30.0 + (step / training_data["training_steps"]) * 60.0
            training_jobs[job_id]["progress"] = progress
            
            if step % 100 == 0:
                training_jobs[job_id]["message"] = f"Training step {step}/{training_data['training_steps']}"
            
            await asyncio.sleep(0.1)  # Simulate training time
        
        training_jobs[job_id]["progress"] = 90.0
        training_jobs[job_id]["message"] = "Saving model..."
        
        # Save the trained model
        model_id = f"lora_{job_id}"
        model_path = MODEL_DIR / model_id
        model_path.mkdir(exist_ok=True)
        
        # Save LoRA weights
        pipeline.save_lora_weights(str(model_path))
        
        # Save model metadata
        metadata = {
            "model_id": model_id,
            "name": training_data["model_name"],
            "training_time": datetime.now().isoformat(),
            "config": training_data,
            "status": "ready"
        }
        
        with open(model_path / "metadata.json", "w") as f:
            json.dump(metadata, f, indent=2)
        
        training_jobs[job_id]["progress"] = 100.0
        training_jobs[job_id]["status"] = "completed"
        training_jobs[job_id]["message"] = "Training completed successfully!"
        training_jobs[job_id]["model_id"] = model_id
        
        logger.info(f"Training completed for job {job_id}")
        
    except Exception as e:
        logger.error(f"Training failed for job {job_id}: {e}")
        training_jobs[job_id]["status"] = "failed"
        training_jobs[job_id]["message"] = f"Training failed: {str(e)}"

# API endpoints
@app.post("/api/train", response_model=Dict[str, str])
async def start_training(
    request: TrainingRequest,
    background_tasks: BackgroundTasks
):
    """Start LoRA training"""
    try:
        job_id = str(uuid.uuid4())
        
        # Validate images
        if len(request.images) < 5:
            raise HTTPException(status_code=400, detail="Minimum 5 images required")
        
        # Initialize training job
        training_jobs[job_id] = {
            "status": "queued",
            "progress": 0.0,
            "message": "Job queued",
            "model_id": None
        }
        
        # Prepare training data
        training_data = {
            "model_name": request.model_name,
            "training_steps": request.training_steps,
            "learning_rate": request.learning_rate,
            "resolution": request.resolution,
            "images": request.images
        }
        
        # Start training in background
        background_tasks.add_task(train_lora_model, job_id, training_data)
        
        logger.info(f"Started training job {job_id}")
        
        return {"job_id": job_id, "message": "Training started"}
    
    except Exception as e:
        logger.error(f"Error starting training: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/training/{job_id}", response_model=TrainingStatus)
async def get_training_status(job_id: str):
    """Get training job status"""
    if job_id not in training_jobs:
        raise HTTPException(status_code=404, detail="Training job not found")
    
    job = training_jobs[job_id]
    return TrainingStatus(
        job_id=job_id,
        status=job["status"],
        progress=job["progress"],
        message=job["message"],
        model_id=job.get("model_id")
    )

@app.post("/api/generate")
async def generate_image(request: GenerationRequest):
    """Generate image using trained LoRA model"""
    try:
        # Load the model
        pipeline = load_model(request.model_id)
        
        # Set seed if provided
        if request.seed is not None:
            torch.manual_seed(request.seed)
        
        # Generate image
        with torch.no_grad():
            image = pipeline(
                prompt=request.prompt,
                negative_prompt=request.negative_prompt,
                guidance_scale=request.guidance_scale,
                num_inference_steps=request.num_steps,
                width=request.width,
                height=request.height
            ).images[0]
        
        # Save generated image
        image_id = str(uuid.uuid4())
        image_path = GENERATED_DIR / f"{image_id}.png"
        image.save(image_path)
        
        # Convert to base64 for response
        import io
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return {
            "image_id": image_id,
            "image_data": f"data:image/png;base64,{image_base64}",
            "prompt": request.prompt,
            "seed": request.seed,
            "model_id": request.model_id
        }
    
    except Exception as e:
        logger.error(f"Error generating image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/models", response_model=List[ModelInfo])
async def list_models():
    """List all trained models"""
    models = []
    
    for model_dir in MODEL_DIR.iterdir():
        if model_dir.is_dir():
            metadata_path = model_dir / "metadata.json"
            if metadata_path.exists():
                with open(metadata_path, "r") as f:
                    metadata = json.load(f)
                    models.append(ModelInfo(**metadata))
    
    return models

@app.get("/api/models/{model_id}", response_model=ModelInfo)
async def get_model_info(model_id: str):
    """Get specific model information"""
    model_path = MODEL_DIR / model_id
    metadata_path = model_path / "metadata.json"
    
    if not metadata_path.exists():
        raise HTTPException(status_code=404, detail="Model not found")
    
    with open(metadata_path, "r") as f:
        metadata = json.load(f)
        return ModelInfo(**metadata)

@app.delete("/api/models/{model_id}")
async def delete_model(model_id: str):
    """Delete a trained model"""
    try:
        model_path = MODEL_DIR / model_id
        
        if not model_path.exists():
            raise HTTPException(status_code=404, detail="Model not found")
        
        # Remove from loaded models if present
        if model_id in loaded_models:
            del loaded_models[model_id]
        
        # Delete model files
        import shutil
        shutil.rmtree(model_path)
        
        return {"message": "Model deleted successfully"}
    
    except Exception as e:
        logger.error(f"Error deleting model {model_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "gpu_available": torch.cuda.is_available(),
        "active_jobs": len([j for j in training_jobs.values() if j["status"] == "training"]),
        "loaded_models": len(loaded_models)
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "lora_api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 