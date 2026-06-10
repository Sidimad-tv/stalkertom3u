from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import importlib
import os
import sys

# Add the app directory to path so we can import the backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = FastAPI()

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
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
            
        # In standalone mode, we don't have a built-in user_id from the platform headers.
        # But the frontend we built explicitly passes user_id in the args.
        # So it should just work.
        result = func(**args)
        return result
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
