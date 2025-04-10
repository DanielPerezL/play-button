from config import db, URL


class Song(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False, unique=True)

    def __init__(self, name):
        self.name = name
        self.mp3_url = ""

    def to_simple_dto(self):
        return {
            "id": self.id,
            "name": self.name,
        }
    
    def to_details_dto(self):
        return {
            "id": self.id,
            "name": self.name,
            "mp3_url": f"{URL}/uploads/mp3_files/{self.id}.mp3",
        }
