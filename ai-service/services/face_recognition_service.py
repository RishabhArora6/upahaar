import hashlib

def generate_embedding(image_bytes: bytes):
    """
    Mock function for ArcFace/FaceNet embedding generation.
    Returns a dummy 16-dimensional vector.
    """
    print("Extracting Face Embedding using ArcFace/FaceNet...")
    h = hashlib.sha256(image_bytes).hexdigest()
    return [float(int(h[i:i+2], 16)) / 255.0 for i in range(0, 32, 2)]

def compare_faces(emb1: list, emb2: list):
    """ Mock cosine similarity. """
    return 0.95
