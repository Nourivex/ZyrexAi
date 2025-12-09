"""
System Info Tool - Get system information
"""
from datetime import datetime
from typing import Dict, Any
import psutil
from loguru import logger


async def system_info_tool(info_type: str) -> Dict[str, Any]:
    """
    Get system information
    
    Args:
        info_type: Type of info (time, date, datetime, cpu, memory, disk, all)
        
    Returns:
        System information dict
    """
    logger.info(f"Getting system info: {info_type}")
    
    result = {}
    
    if info_type in ["time", "datetime", "all"]:
        now = datetime.now()
        result["time"] = now.strftime("%H:%M:%S")
    
    if info_type in ["date", "datetime", "all"]:
        now = datetime.now()
        result["date"] = now.strftime("%Y-%m-%d")
        result["day_of_week"] = now.strftime("%A")
    
    if info_type in ["cpu", "all"]:
        result["cpu_percent"] = psutil.cpu_percent(interval=1)
        result["cpu_count"] = psutil.cpu_count()
    
    if info_type in ["memory", "all"]:
        mem = psutil.virtual_memory()
        result["memory_total_gb"] = round(mem.total / (1024**3), 2)
        result["memory_used_gb"] = round(mem.used / (1024**3), 2)
        result["memory_percent"] = mem.percent
    
    if info_type in ["disk", "all"]:
        disk = psutil.disk_usage('/')
        result["disk_total_gb"] = round(disk.total / (1024**3), 2)
        result["disk_used_gb"] = round(disk.used / (1024**3), 2)
        result["disk_percent"] = disk.percent
    
    logger.success(f"Retrieved system info: {list(result.keys())}")
    return result
