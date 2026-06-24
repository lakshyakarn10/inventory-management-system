from pydantic import BaseModel

class ItemCreate(BaseModel):
    name: str
    quantity:int
    price: float
    description: str
    category: str

class ItemResponse(ItemCreate):
    id: int