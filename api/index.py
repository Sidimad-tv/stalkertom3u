from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Add the backend directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

app = FastAPI()

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/data")
async def rpc_handler(request: Request):
    try:
        data = await request.json()
        func_name = data.get("func")
        args = data.get("args", {})
        
        # Import the main module
        import main
        func = getattr(main, func_name)
        
        if not func:
            raise HTTPException(status_code=404, detail=f"Function {func_name} not found")
            
        result = func(**args)
        return result
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Vercel serverless function handler
from mangum import Mangum
handler = Mangum(app)
