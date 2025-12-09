"""
Agent Runner - Execute agents with ReAct pattern and function calling
"""
from typing import List, Dict, Any, Optional
from loguru import logger
from app.services.ollama import get_ollama_service
from app.tools.registry import get_tool_registry
from app.config import settings
import json
import re


class AgentExecutionStep:
    """Represents one step in agent execution"""
    
    def __init__(
        self,
        step_number: int,
        thought: str,
        action: str,
        action_input: Dict[str, Any],
        observation: str
    ):
        self.step_number = step_number
        self.thought = thought
        self.action = action
        self.action_input = action_input
        self.observation = observation
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "step_number": self.step_number,
            "thought": self.thought,
            "action": self.action,
            "action_input": self.action_input,
            "observation": self.observation
        }


class AgentRunner:
    """Execute agents using ReAct (Reasoning + Acting) pattern"""
    
    def __init__(
        self,
        model: str = None,
        max_iterations: int = None,
        tool_timeout: int = None
    ):
        self.model = model or settings.OLLAMA_PRIMARY_MODEL
        self.max_iterations = max_iterations or settings.AGENT_MAX_ITERATIONS
        self.tool_timeout = tool_timeout or settings.AGENT_TOOL_TIMEOUT
        self.tool_registry = get_tool_registry()
    
    def _build_react_prompt(
        self,
        task: str,
        tools: List[str],
        history: List[AgentExecutionStep]
    ) -> str:
        """
        Build ReAct prompt for agent
        
        Args:
            task: User task
            tools: List of enabled tool names
            history: Execution history
            
        Returns:
            Formatted prompt
        """
        # Get tool descriptions
        tool_descriptions = self.tool_registry.get_tools_for_prompt(tools)
        tool_names = ", ".join(tools)
        
        # Build history
        history_text = ""
        if history:
            for step in history:
                history_text += f"""
Thought: {step.thought}
Action: {step.action}
Action Input: {json.dumps(step.action_input)}
Observation: {step.observation}

"""
        
        prompt = f"""You are an autonomous agent that can use tools to complete tasks. 

Available Tools:
{tool_descriptions}

Use the following format for EVERY response:

Thought: Think about what to do next
Action: Choose one tool from [{tool_names}] or use FINISH
Action Input: Provide parameters as JSON object
Observation: [This will be filled by the system]

When you have the final answer, use:
Thought: I now have the final answer
Action: FINISH
Action Input: {{"answer": "your final answer here"}}

IMPORTANT:
- Always provide valid JSON for Action Input
- Use tools one at a time
- Think step by step
- Use FINISH when you have the complete answer

Task: {task}

{history_text}"""
        
        return prompt
    
    def _parse_react_response(self, response: str) -> Dict[str, Any]:
        """
        Parse agent's ReAct response
        
        Args:
            response: Raw LLM response
            
        Returns:
            Parsed thought, action, and action_input
        """
        # Extract Thought
        thought_match = re.search(r'Thought:\s*(.+?)(?=\nAction:|\n\n|$)', response, re.DOTALL)
        thought = thought_match.group(1).strip() if thought_match else "No thought provided"
        
        # Extract Action
        action_match = re.search(r'Action:\s*(\w+)', response)
        action = action_match.group(1).strip() if action_match else "UNKNOWN"
        
        # Extract Action Input (JSON)
        action_input = {}
        action_input_match = re.search(r'Action Input:\s*(\{.+?\})', response, re.DOTALL)
        if action_input_match:
            try:
                action_input = json.loads(action_input_match.group(1))
            except json.JSONDecodeError:
                logger.warning("Failed to parse Action Input JSON")
                # Try to extract simple key-value pairs
                input_text = action_input_match.group(1)
                # Fallback: treat as simple string
                action_input = {"input": input_text}
        
        return {
            "thought": thought,
            "action": action,
            "action_input": action_input
        }
    
    async def run(
        self,
        task: str,
        tools: List[str],
        system_prompt: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Run agent on a task
        
        Args:
            task: Task description
            tools: List of enabled tool names
            system_prompt: Optional system prompt override
            
        Returns:
            Execution result with steps
        """
        logger.info(f"Running agent on task: {task[:100]}...")
        
        ollama = await get_ollama_service()
        history: List[AgentExecutionStep] = []
        
        for i in range(self.max_iterations):
            logger.info(f"Agent iteration {i+1}/{self.max_iterations}")
            
            # Build prompt
            prompt = self._build_react_prompt(task, tools, history)
            
            # Generate response
            try:
                response = await ollama.generate(
                    prompt=prompt,
                    system=system_prompt or "You are a helpful AI agent that uses tools to complete tasks.",
                    model=self.model,
                    temperature=0.1  # Low temperature for consistent reasoning
                )
                
                response_text = response.get("response", "")
                logger.info(f"Agent response: {response_text[:200]}...")
                
                # Parse response
                parsed = self._parse_react_response(response_text)
                
                # Check if finished
                if parsed["action"].upper() == "FINISH":
                    final_answer = parsed["action_input"].get("answer", "Task completed")
                    logger.success(f"✅ Agent finished: {final_answer[:100]}")
                    
                    return {
                        "success": True,
                        "result": final_answer,
                        "steps": [step.to_dict() for step in history],
                        "iterations": i + 1
                    }
                
                # Execute tool
                observation = ""
                if parsed["action"] in tools:
                    logger.info(f"Executing tool: {parsed['action']}")
                    tool_result = await self.tool_registry.execute_tool(
                        parsed["action"],
                        parsed["action_input"]
                    )
                    
                    if tool_result["success"]:
                        observation = json.dumps(tool_result["result"], indent=2)
                    else:
                        observation = f"Tool error: {tool_result.get('error', 'Unknown error')}"
                else:
                    observation = f"Unknown action: {parsed['action']}. Available tools: {', '.join(tools)}"
                
                # Record step
                step = AgentExecutionStep(
                    step_number=i + 1,
                    thought=parsed["thought"],
                    action=parsed["action"],
                    action_input=parsed["action_input"],
                    observation=observation
                )
                history.append(step)
            
            except Exception as e:
                logger.error(f"Agent execution error: {e}")
                return {
                    "success": False,
                    "error": f"Agent execution failed: {str(e)}",
                    "steps": [step.to_dict() for step in history],
                    "iterations": i + 1
                }
        
        # Max iterations reached
        logger.warning(f"Agent reached max iterations ({self.max_iterations})")
        return {
            "success": False,
            "error": f"Max iterations ({self.max_iterations}) reached without finishing",
            "steps": [step.to_dict() for step in history],
            "iterations": self.max_iterations
        }


# Global runner instance
_agent_runner: Optional[AgentRunner] = None


def get_agent_runner() -> AgentRunner:
    """Get or create agent runner instance"""
    global _agent_runner
    if _agent_runner is None:
        _agent_runner = AgentRunner()
    return _agent_runner
