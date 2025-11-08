from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import io
import numpy as np
from PIL import Image
import cv2
from ultralytics import YOLO
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="RoadEye AI Detection Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load YOLOv8 model (use custom trained model or pretrained)
# For production, replace with your custom-trained model
try:
    model = YOLO('yolov8n.pt')  # Using nano model for speed
    logger.info("YOLOv8 model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    model = None


class DetectionRequest(BaseModel):
    imageBase64: str
    latitude: float
    longitude: float


class DetectionResponse(BaseModel):
    detected: bool
    hazard: dict = None
    confidence: float = 0.0
    bounding_boxes: list = []


def decode_base64_image(base64_string: str) -> np.ndarray:
    """Decode base64 string to numpy array image"""
    try:
        # Remove data URL prefix if present
        if ',' in base64_string:
            base64_string = base64_string.split(',')[1]
        
        image_bytes = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_bytes))
        return cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
    except Exception as e:
        logger.error(f"Failed to decode image: {e}")
        raise HTTPException(status_code=400, detail="Invalid base64 image")


def blur_sensitive_info(image: np.ndarray) -> np.ndarray:
    """Blur faces and license plates for privacy"""
    # Load face detection cascade
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )
    
    # Detect faces
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    # Blur detected faces
    for (x, y, w, h) in faces:
        face_region = image[y:y+h, x:x+w]
        blurred_face = cv2.GaussianBlur(face_region, (99, 99), 30)
        image[y:y+h, x:x+w] = blurred_face
    
    # TODO: Add license plate detection and blurring
    # This would require a separate model or cascade classifier
    
    return image


def detect_hazard(image: np.ndarray) -> dict:
    """
    Detect road hazards using YOLOv8
    Returns hazard type, confidence, and bounding boxes
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    # Run inference
    results = model(image, conf=0.25)
    
    # Map YOLO classes to hazard types
    # This mapping depends on your custom-trained model
    # For demo purposes, using generic object detection
    hazard_mapping = {
        'pothole': ['hole', 'crack', 'damage'],
        'debris': ['bottle', 'bag', 'box', 'trash'],
        'accident': ['car', 'truck', 'person'],
        'construction': ['cone', 'barrier', 'sign'],
    }
    
    detected_objects = []
    max_confidence = 0.0
    detected_hazard_type = None
    
    for result in results:
        boxes = result.boxes
        for box in boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            class_name = model.names[cls].lower()
            
            # Check if detected object matches any hazard type
            for hazard_type, keywords in hazard_mapping.items():
                if any(keyword in class_name for keyword in keywords):
                    if conf > max_confidence:
                        max_confidence = conf
                        detected_hazard_type = hazard_type
                    
                    # Get bounding box coordinates
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    detected_objects.append({
                        'type': hazard_type,
                        'confidence': conf,
                        'bbox': [int(x1), int(y1), int(x2), int(y2)],
                        'class': class_name
                    })
    
    return {
        'detected': len(detected_objects) > 0,
        'hazard_type': detected_hazard_type or 'other',
        'confidence': max_confidence,
        'objects': detected_objects
    }


@app.get("/")
async def root():
    return {
        "service": "RoadEye AI Detection Service",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None
    }


@app.post("/detect", response_model=DetectionResponse)
async def detect(request: DetectionRequest):
    """
    Detect road hazards from base64 encoded image
    """
    try:
        # Decode image
        image = decode_base64_image(request.imageBase64)
        
        # Blur sensitive information
        image = blur_sensitive_info(image)
        
        # Detect hazards
        detection_result = detect_hazard(image)
        
        if detection_result['detected']:
            # Determine severity based on confidence and hazard type
            severity = 'high' if detection_result['confidence'] > 0.7 else \
                      'medium' if detection_result['confidence'] > 0.5 else 'low'
            
            hazard = {
                'type': detection_result['hazard_type'],
                'latitude': request.latitude,
                'longitude': request.longitude,
                'severity': severity,
                'description': f"Auto-detected: {detection_result['hazard_type']}"
            }
            
            return DetectionResponse(
                detected=True,
                hazard=hazard,
                confidence=detection_result['confidence'],
                bounding_boxes=detection_result['objects']
            )
        else:
            return DetectionResponse(
                detected=False,
                confidence=0.0
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Detection error: {e}")
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
