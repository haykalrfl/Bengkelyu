from fastapi import FastAPI

app = FastAPI(
    title="BengkelKu API",
    description="Workshop Management System",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "Welcome to BengkelKu API"
    }

@app.get("/orders")
def get_orders():
    return {
        "orders": [
            {
                "id": "SRV-0012",
                "customer": "Budi Santoso",
                "vehicle": "Honda Beat",
                "status": "Menunggu persetujuan"
            }
        ]
    }