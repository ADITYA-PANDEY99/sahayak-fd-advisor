import os
import sys
from dotenv import load_dotenv
load_dotenv()
from core.gemini_client import GeminiClient

g = GeminiClient(os.getenv('GEMINI_API_KEY'))
try:
    print(g.chat('FD kya hai?'))
except Exception as e:
    print('CAUGHT:', e)
