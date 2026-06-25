from fastapi import FastAPI,HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from schemas import Item
from models import ItemResponse, ItemCreate
from database import Base, engine, get_db
from sqlalchemy.orm import Session
app=FastAPI()

Base.metadata.create_all(bind=engine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173",
                   "https://inventory-management-system.lakshyakarn.com.np",
                   "https://inventory-management-system-lyart-xi.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
def greet():
    return "Inventory API Running"
         
@app.get("/items")
def get_items(
    db: Session=Depends(get_db)
):
    return db.query(Item).all()

@app.post("/items")
def create_item(
    item:ItemCreate,
    db: Session=Depends(get_db)
    ):
    

    new_item= Item(
        name=item.name,
        quantity=item.quantity,
        price=item.price,
        description=item.description,
        category=item.category
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.put("/items/{item_id}")
def put_item(
    item_id:int,
    item: ItemCreate,
    db: Session= Depends(get_db)
    ):
    db_item=db.query(Item).filter(
        Item.id==item_id
    ).first()

    if not db_item:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )
    db_item.name=item.name
    db_item.description=item.description
    db_item.category=item.category
    db_item.quantity=item.quantity
    db_item.price=item.price

    db.commit()
    db.refresh(db_item)
    return db_item
        
@app.delete("/items/{item_id}")
def delete_item(
    item_id:int,
    db: Session = Depends(get_db)
    ):
    db_item=db.query(Item).filter(
        Item.id==item_id
    ).first()
    if not db_item:
        raise HTTPException(
            status_code=404,
            detail="Item not found"
        )
    db.delete(db_item)
    db.commit()
    return {
        "message": "Item deleted successfully"
    }
    






