"""
Ollama Service - LLM integration with streaming support
Handles connection to Ollama API with fallback logic
"""
import httpx
from typing import AsyncGenerator, Optional, Dict, Any, List
from loguru import logger
from app.config import settings
import json


class OllamaService:
    """Service for interacting with Ollama API"""
    
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.primary_model = settings.OLLAMA_PRIMARY_MODEL
        self.fallback_model = settings.OLLAMA_FALLBACK_MODEL
        self.client = httpx.AsyncClient(timeout=300.0)
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
    
    async def check_health(self) -> Dict[str, Any]:
        """
        Check Ollama service health and available models
        
        Returns:
            Dict with status and available models
        """
        try:
            response = await self.client.get(f"{self.base_url}/api/tags")
            if response.status_code == 200:
                data = response.json()
                models = [model["name"] for model in data.get("models", [])]
                return {
                    "status": "online",
                    "models": models,
                    "primary_available": self.primary_model in models,
                    "fallback_available": self.fallback_model in models
                }
        except Exception as e:
            logger.error(f"Ollama health check failed: {e}")
        
        return {
            "status": "offline",
            "models": [],
            "primary_available": False,
            "fallback_available": False
        }
    
    async def generate(
        self,
        prompt: str,
        model: Optional[str] = None,
        system: Optional[str] = None,
        temperature: float = 0.7,
        format: Optional[str] = None,
        context: Optional[List[int]] = None
    ) -> Dict[str, Any]:
        """
        Generate completion from Ollama (non-streaming)
        
        Args:
            prompt: User prompt
            model: Model to use (defaults to primary)
            system: System prompt
            temperature: Sampling temperature (0.0 - 2.0)
            format: Response format ('json' for JSON mode)
            context: Context from previous conversation
            
        Returns:
            Response dict with generated text and metadata
        """
        if model is None:
            model = self.primary_model
        
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature
            }
        }
        
        if system:
            payload["system"] = system
        
        if format:
            payload["format"] = format
        
        if context:
            payload["context"] = context
        
        try:
            logger.info(f"Generating with model: {model}")
            response = await self.client.post(
                f"{self.base_url}/api/generate",
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                logger.success(f"Generated {len(result.get('response', ''))} chars")
                return result
            else:
                # Try fallback model
                if model == self.primary_model:
                    logger.warning(f"Primary model failed, trying fallback: {self.fallback_model}")
                    return await self.generate(
                        prompt=prompt,
                        model=self.fallback_model,
                        system=system,
                        temperature=temperature,
                        format=format,
                        context=context
                    )
                else:
                    raise Exception(f"Ollama API error: {response.status_code}")
        
        except httpx.TimeoutException:
            logger.error("Ollama request timeout")
            raise Exception("Request timeout - model may be loading")
        except Exception as e:
            logger.error(f"Ollama generation error: {e}")
            raise
    
    async def generate_stream(
        self,
        prompt: str,
        model: Optional[str] = None,
        system: Optional[str] = None,
        temperature: float = 0.7,
        format: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Generate streaming completion from Ollama
        
        Args:
            prompt: User prompt
            model: Model to use (defaults to primary)
            system: System prompt
            temperature: Sampling temperature
            format: Response format ('json' for JSON mode)
            
        Yields:
            Chunks of generated text
        """
        if model is None:
            model = self.primary_model
        
        payload = {
            "model": model,
            "prompt": prompt,
            "stream": True,
            "options": {
                "temperature": temperature
            }
        }
        
        if system:
            payload["system"] = system
        
        if format:
            payload["format"] = format
        
        try:
            logger.info(f"Streaming with model: {model}")
            
            async with self.client.stream(
                "POST",
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=300.0
            ) as response:
                if response.status_code != 200:
                    raise Exception(f"Ollama API error: {response.status_code}")
                
                async for line in response.aiter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            if "response" in data:
                                yield data["response"]
                            
                            # Check if done
                            if data.get("done", False):
                                logger.success("Streaming complete")
                                break
                        except json.JSONDecodeError:
                            continue
        
        except httpx.TimeoutException:
            logger.error("Ollama streaming timeout")
            raise Exception("Streaming timeout")
        except Exception as e:
            logger.error(f"Ollama streaming error: {e}")
            
            # Try fallback model if primary failed
            if model == self.primary_model:
                logger.warning(f"Retrying with fallback model: {self.fallback_model}")
                async for chunk in self.generate_stream(
                    prompt=prompt,
                    model=self.fallback_model,
                    system=system,
                    temperature=temperature,
                    format=format
                ):
                    yield chunk
            else:
                raise
    
    async def chat(
        self,
        messages: List[Dict[str, Any]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        stream: bool = False,
        images: Optional[List[str]] = None
    ):
        """
        Chat completion using Ollama's chat endpoint (supports multimodal with images)
        
        Args:
            messages: List of chat messages [{"role": "user", "content": "..."}]
            model: Model to use (for vision, use llava, bakllava, or llava-llama3)
            temperature: Sampling temperature
            stream: Enable streaming
            images: List of base64 encoded images (for vision models)
            
        Returns:
            Streaming async generator if stream=True, dict if stream=False
            
        Note:
            For vision capabilities, use models like:
            - llava:7b (general vision)
            - llava:13b (better accuracy)
            - bakllava:7b (better at OCR)
            - llava-llama3:latest (best performance)
        """
        if model is None:
            model = self.primary_model
        
        payload = {
            "model": model,
            "messages": messages,
            "stream": stream,
            "options": {
                "temperature": temperature
            }
        }
        
        # Add images if provided (for multimodal)
        if images and len(images) > 0:
            # Attach images to the last user message
            if messages and messages[-1].get("role") == "user":
                messages[-1]["images"] = images
                logger.info(f"🖼️ Sending {len(images)} image(s) to vision model")
        
        try:
            if stream:
                return self._chat_stream(payload)
            else:
                response = await self.client.post(
                    f"{self.base_url}/api/chat",
                    json=payload
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    raise Exception(f"Ollama chat API error: {response.status_code}")
        
        except Exception as e:
            logger.error(f"Ollama chat error: {e}")
            raise
    
    async def _chat_stream(self, payload: Dict[str, Any]):
        """Internal method for streaming chat"""
        async with self.client.stream(
            "POST",
            f"{self.base_url}/api/chat",
            json=payload,
            timeout=300.0
        ) as response:
            if response.status_code != 200:
                raise Exception(f"Ollama chat API error: {response.status_code}")
            
            async for line in response.aiter_lines():
                if line:
                    try:
                        data = json.loads(line)
                        if "message" in data:
                            content = data["message"].get("content", "")
                            if content:
                                yield content
                        
                        if data.get("done", False):
                            break
                    except json.JSONDecodeError:
                        continue


# Global service instance
_ollama_service: Optional[OllamaService] = None


async def get_ollama_service() -> OllamaService:
    """Get or create Ollama service instance"""
    global _ollama_service
    if _ollama_service is None:
        _ollama_service = OllamaService()
    return _ollama_service
